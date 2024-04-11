import { z } from "zod";
import { QuestionType,  } from "@prisma/client";
import { upsertResources, UpsertResource, connectOrCreateResources } from "./resourceController.js";
import { upsertOrDisconnectTopics, UpsertTopic } from "./topicController.js";
import { APIError, NotFoundError } from "../middleware/errors/index.js";
import { Request, Response } from "express";
import FlagEncoder from "../helpers/encoder.js";
import Formatter from "../helpers/formatter.js";
import Resolver from "../helpers/resolver.js";
import prisma from "../prisma/prisma.js";
import { randomUUID } from "node:crypto";

export const QuestionFlags = z.object({
    published:              z.boolean().default(false),
    disableRandomAnswers:   z.boolean().default(true),
    answersStartHidden:     z.boolean().default(true)
});

export const ParentData = z.object({
    body:           z.string().optional(),
    solution:       z.undefined(),
    numberingType:  z.enum([ "LOWERCASE", "UPPERCASE", "ROMAN_LOWERCASE", "ROMAN_UPPERCASE", "NUMBER" ])
});

export const MultipleChoiceData = z.object({
    body:           z.string().optional(),
    solution:       z.array(z.number()),
});

export const FreeResponseData = z.object({
    body:       z.string().optional(),
    solution:   z.string().optional(),
});

export const ShortAnswerData = FreeResponseData;

export const FillInBlankData = FreeResponseData;

export const QuestionData = z.union([
    ParentData, MultipleChoiceData, FreeResponseData, ShortAnswerData, FillInBlankData
]);

export const UpsertAnswerChoice = z.object({
    id:         z.string().default(randomUUID),
    index:      z.number(),
    body:       z.string().optional(),
    resources:  z.array(UpsertResource).optional(),
});

export const UpsertExplanation = z.object({
    id:         z.string().uuid().default(randomUUID),
    body:       z.string().optional(),
    resources:  z.array(UpsertResource).optional()
});

export const CreateQuestion = z.object({
    type:       z.nativeEnum(QuestionType).default(QuestionType.MULTIPLE_CHOICE),
    data:       QuestionData,
    number:     z.number().min(1),
    courseId:   z.string().uuid(),
    examId:     z.string().uuid(),
    parentId:   z.string().uuid().optional(),
    flags:      QuestionFlags.optional().default({  }),
});

export const UpdateQuestion = z.object({
    type:           z.nativeEnum(QuestionType).optional(),
    data:           QuestionData.optional(),
    flags:          QuestionFlags.optional(),
    topics:         z.array(UpsertTopic).optional(),
    resources:      z.array(UpsertResource).optional(),
    answerChoices:  z.array(UpsertAnswerChoice).optional().optional(),
    explanation:    UpsertExplanation.optional()
});

export const FullQuestion = {
    resources: true,
    exam: true,
    explanation: {
        include: {
            resources: true
        }
    },
    answerChoices: {
        include: {
            resources: true
        }
    },
    topics: {
        include: {
            topic: true
        }
    },
    children: {
        include: {
            resources: true,
            exam: true,
            explanation: {
                include: {
                    resources: true
                }
            },
            answerChoices: {
                include: {
                    resources: true
                }
            },
            topics: {
                include: {
                    topic: true
                }
            }
        }
    }
};

export const PartialQuestion = {
    id: true,
    number: true,
    flags: true,
    topics: {
        include: {
            topic: true
        }
    },
    children: {
        select: {
            id: true,
            number: true,
            flags: true,
        }
    }
};

export async function createQuestion(req: Request, res: Response) {
    const options = CreateQuestion.parse(req.body);

    const question = await prisma.$transaction(async (prisma) => {
        // 1. Insert the new question
        const question = await prisma.question.create({
            data: {
                ...options,
                flags: FlagEncoder.question(options.flags),
            },
            include: FullQuestion
        });

        // 2. Update existing questions
        await prisma.question.updateMany({
            where: {
                examId: question.examId,
                parentId: question.parentId,
                number: {
                    gte: question.number
                }
            },
            data: {
                number: {
                    increment: 1
                }
            }
        });

        return question;
    });

    res.status(200).send(Formatter.question({
        data: question,
        sendUnpublished: req.sendUnpublished
    }));
}

export async function getQuestion(req: Request, res: Response) {
    const { q, t, e, c } = req.params;

    const question = await prisma.question.findFirstOrThrow({
        where: await Resolver.question(q, t, e, c),
        include: FullQuestion
    });

    if (!question.flags.published && !req.sendUnpublished) {
        throw new NotFoundError("Question not found");
    }

    res.status(200).send(Formatter.question({
        data: question,
        sendUnpublished: req.sendUnpublished
    }));
}

export async function updateQuestion(req: Request, res: Response) {
    const { q, t, e, c } = req.params;
    const options = UpdateQuestion.parse(req.body);

    const question = await prisma.question.findFirstOrThrow({
        where: await Resolver.question(q, t, e, c),
        include: {
            topics: {
                include: {
                    topic: true
                }
            }
        }
    });

    const updatedQuestion = await prisma.question.update({
        where: {
            id: question.id
        },
        data: {
            ...options,
            number: undefined, // Block update to question number
            flags: options.flags ? FlagEncoder.question(options.flags) : options.flags,
            topics: upsertOrDisconnectTopics(question.id, question.courseId, question.topics.map(topic => topic.topicId), options.topics),
            resources: upsertResources(options.resources),
            answerChoices: upsertAnswerChoices(options.answerChoices),
            explanation: upsertExplanation(options.explanation)
        },
        include: FullQuestion
    });

    res.status(200).send(Formatter.question({
        data: updatedQuestion,
        sendUnpublished: req.sendUnpublished
    }));
}

export async function toggleQuestionPublished(req: Request, res: Response) {
    const { q, t, e, c } = req.params;

    // Need to hack since we can't force uniqueness on question numbers
    const question = await prisma.question.findFirstOrThrow({
        where: await Resolver.question(q, t, e, c),
        select: {
            id: true,
            exam: {
                select: {
                    flags: true
                }
            },
            flags: true
        }
    });

    if (!question) {
        throw new NotFoundError("Question not found");
    }

    if (!question.exam.flags.published) {
        throw new APIError("Exam must be published", 409);
    }

    const status = !question.flags.published;

    await prisma.question.update({
        where: {
            id: question.id,
        },
        data: {
            flags: FlagEncoder.question({
                ...question.flags,
                published: status
            })
        },
    });

    res.status(200).send({
        message: `Question is now ${status ? "published" : "unpublished"}`,
    });
}

export async function deleteQuestion(req: Request, res: Response) {
    const { questionId } = req.params;

    const question = await prisma.question.findUnique({
        where: {
            id: questionId
        }
    });

    if (!question) {
        throw new NotFoundError(`Question not found: ${questionId}`);
    }

    await prisma.$transaction(async (prisma) => {
        // Delete the question
        await prisma.question.delete({
            where: {
                id: questionId
            }
        });

        // Update question numbers for remaining questions in the same exam and with the same parent
        await prisma.question.updateMany({
            where: {
                examId: question.examId,
                parentId: question.parentId,
                number: {
                    gt: question.number
                }
            },
            data: {
                number: {
                    decrement: 1
                }
            }
        });
    });

    res.status(200).send(question);
}

export async function deleteAnswerChoice(req: Request, res: Response) {
    const { answerChoiceId } = req.params;

    const answerChoice = await prisma.answerChoice.delete({
        where: {
            id: answerChoiceId
        }
    });

    if (!answerChoice) {
        throw new NotFoundError(`AnswerChoice not found: ${answerChoice}`);
    }

    res.status(200).send(answerChoice);
}

function upsertAnswerChoices(answerChoices?: z.infer<typeof UpsertAnswerChoice>[]) {
    return {
        upsert: answerChoices?.map(ac => {
            return {
                where: {
                    id: ac.id
                },
                create: {
                    index: ac.index,
                    body: ac.body,
                    resources: connectOrCreateResources(ac.resources)
                },
                update: {
                    index: ac.index,
                    body: ac.body,
                    resources: upsertResources(ac.resources)
                }
            };
        })
    };
}

function upsertExplanation(explanation?: z.infer<typeof UpsertExplanation>) {
    return explanation ? {
        upsert: {
            where: {
                id: explanation.id
            },
            create: {
                body: explanation.body,
                resources: connectOrCreateResources(explanation.resources)
            },
            update: {
                body: explanation.body,
                resources: upsertResources(explanation.resources)
            }
        }
    } : explanation;
}