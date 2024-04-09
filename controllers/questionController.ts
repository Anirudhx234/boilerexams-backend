import { z } from "zod";
import { QuestionType,  } from "@prisma/client";
import { UpsertResource } from "./resourceController.js";
import { UpsertTopic } from "./topicController.js";
import { APIError, NotFoundError } from "../middleware/errors/index.js";
import type { Request, Response } from "express";
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

});

export const CreateQuestion = z.object({
    type:       z.nativeEnum(QuestionType).default(QuestionType.MULTIPLE_CHOICE),
    data:       QuestionData,
    number:     z.number().min(1),
    courseId:   z.string().uuid(),
    examId:     z.string().uuid(),
    parentId:   z.string().uuid().optional(),
    flags:      QuestionFlags.optional().default({  }),
}).refine(data => {
    switch (data.type) {
        case QuestionType.PARENT: {
            ParentData.parse(data.data);
        } break;
        case QuestionType.MULTIPLE_CHOICE: {
            MultipleChoiceData.parse(data.data);
        } break;
        case QuestionType.FREE_RESPONSE: {
            FreeResponseData.parse(data.data);
        } break;
        case QuestionType.SHORT_ANSWER: {
            ShortAnswerData.parse(data.data);
        } break;
        case QuestionType.FILL_IN_BLANK: {
            FillInBlankData.parse(data.data);
        } break;
    }
    return true;
});

export const UpdateQuestion = z.object({
    type:           z.nativeEnum(QuestionType).optional(),
    data:           QuestionData.optional(),
    number:         z.number().min(1).optional(),
    flags:          QuestionFlags.optional(),
    topics:         z.array(UpsertTopic).optional(),
    resources:      z.array(UpsertResource).optional(),
    answerChoices:  z.array(UpsertAnswerChoice).optional()
}).refine(data => {
    if (data.type && data.data) {
        switch (data.type) {
            case QuestionType.PARENT: {
                ParentData.parse(data.data);
            } break;
            case QuestionType.MULTIPLE_CHOICE: {
                MultipleChoiceData.parse(data.data);
            } break;
            case QuestionType.FREE_RESPONSE: {
                FreeResponseData.parse(data.data);
            } break;
            case QuestionType.SHORT_ANSWER: {
                ShortAnswerData.parse(data.data);
            } break;
            case QuestionType.FILL_IN_BLANK: {
                FillInBlankData.parse(data.data);
            } break;
        }
    }
    return true;
}, "Data type must match specified type");

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
    }
};

export async function createQuestion(req: Request, res: Response) {
    const options = CreateQuestion.parse(req.body);

    const question = await prisma.question.create({
        data: {
            ...options,
            flags: FlagEncoder.question(options.flags),
        }
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
    });

    const topics = options.topics?.map(topic => {
        return {
            where: {
                questionId_topicId: {
                    questionId: question.id,
                    topicId: topic.id
                }
            },
            create: {
                topic: {
                    connectOrCreate: {
                        where: {
                            id: topic.id
                        },
                        create: {
                            name: topic.name,
                            courseId: question.courseId
                        }
                    }
                }
            }
        };
    });

    const answerChoices = options.answerChoices?.map(ac => {
        const resources = ac.resources?.map(resource => {
            return {
                where: {
                    id: resource.id
                },
                create: resource
            };
        });

        return {
            where: {
                id: ac.id
            },
            create: {
                ...ac,
                resources: {
                    connectOrCreate: resources
                }
            }
        };
    });

    const resources = options.resources?.map(resource => {
        return {
            where: {
                id: resource.id
            },
            create: resource
        };
    });

    const updatedQuestion = await prisma.question.update({
        where: {
            id: question.id
        },
        data: {
            flags: options.flags ? FlagEncoder.question(options.flags) : options.flags,
            topics: {
                connectOrCreate: topics
            },
            resources: {
                connectOrCreate: resources
            },
            answerChoices: {
                connectOrCreate: answerChoices,
            }
        },
        include: {
            topics: {
                include: {
                    topic: true
                }
            },
            answerChoices: true,
            resources: true,
        }
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

    // More hacks because question number is not unique
    const question = await prisma.question.delete({
        where: {
            id: questionId
        }
    });

    if (!question) {
        throw new NotFoundError(`Question not found: ${questionId}`);
    }
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