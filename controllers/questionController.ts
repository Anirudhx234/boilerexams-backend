import { Request, Response } from "express";
import { QuestionType } from "@prisma/client";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import prisma from "../prisma/prisma.js";
import FlagEncoder from "../helpers/encoder.js";
import Formatter from "../helpers/formatter.js";
import Resolver from "../helpers/resolver.js";
import APIError from "../middleware/errors/APIError.js";
import { connectOrCreateResources, UpsertResourceOptions, upsertResources } from "./resourceController.js";
import { upsertOrDisconnectTopics, UpsertTopic } from "./topicController.js";

export const QuestionFlags = z.object({
    published: z.boolean().default(false),
    disableRandomAnswers: z.boolean().default(true),
    answersStartHidden: z.boolean().default(true)
});

export const ParentData = z.object({
    body: z.string().optional(),
    solution: z.undefined(),
    numberingType: z.enum(["LOWERCASE", "UPPERCASE", "ROMAN_LOWERCASE", "ROMAN_UPPERCASE", "NUMBER"])
});

export const MultipleChoiceData = z.object({
    body: z.string().optional(),
    solution: z.array(z.number())
});

export const FreeResponseData = z.object({
    body: z.string().optional(),
    solution: z.string().optional()
});

export const ShortAnswerData = FreeResponseData;

export const FillInBlankData = z.object({
    body: z.string().optional(),
    solution: z.array(z.string())
});

export const QuestionData = z.union([ParentData, MultipleChoiceData, FreeResponseData, ShortAnswerData, FillInBlankData]);

export const UpsertAnswerChoiceOptions = z.object({
    id: z.string().default(randomUUID),
    index: z.number(),
    body: z.string().optional().nullable(),
    resources: z.array(UpsertResourceOptions).optional()
});

export const UpsertExplanationOptions = z.object({
    id: z.string().uuid().default(randomUUID),
    body: z.string().optional().nullable(),
    resources: z.array(UpsertResourceOptions).optional()
});

export const CreateQuestionOptions = z.object({
    type: z.nativeEnum(QuestionType).default(QuestionType.MULTIPLE_CHOICE),
    data: QuestionData,
    number: z.number().min(1),
    courseId: z.string().uuid(),
    examId: z.string().uuid(),
    parentId: z.string().uuid().optional().nullable(),
    flags: QuestionFlags.optional().default({})
});

export const UpdateQuestionOptions = z.object({
    type: z.nativeEnum(QuestionType).optional(),
    data: QuestionData.optional(),
    flags: QuestionFlags.optional(),
    topics: z.array(UpsertTopic).optional(),
    resources: z.array(UpsertResourceOptions).optional(),
    answerChoices: z.array(UpsertAnswerChoiceOptions).optional().optional(),
    explanation: UpsertExplanationOptions.optional()
}).strict();

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
        },
        orderBy: {
            index: "asc" as const
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
                },
                orderBy: {
                    index: "asc" as const
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
    stats: true,
    type: true,
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
            stats: true,
            type: true,
        }
    }
};

export async function createQuestion(req: Request, res: Response) {
    const options = CreateQuestionOptions.parse(req.body);

    const question = await prisma.$transaction(async (prisma) => {
        // 1. Insert the new question
        // 2. Update existing questions
        await prisma.question.updateMany({
            where: {
                examId: options.examId,
                parentId: options.parentId,
                number: {
                    gte: options.number
                }
            },
            data: {
                number: {
                    increment: 1
                }
            }
        });

        return await prisma.question.create({
            data: {
                ...options,
                flags: FlagEncoder.question(options.flags),
                explanation: {
                    create: {}
                }
            },
            include: FullQuestion
        });
    });

    res.status(200).send(
        Formatter.question({
            data: question,
            sendUnpublished: req.sendUnpublished
        })
    );
}

export async function getQuestion(req: Request, res: Response) {
    const question = await prisma.question.findFirstOrThrow({
        where: await Resolver.question(req.params),
        include: FullQuestion
    });

    if (!question.flags.published && !req.sendUnpublished) {
        throw new APIError("Question not found", 404);
    }

    res.status(200).send(
        Formatter.question({
            data: question,
            sendUnpublished: req.sendUnpublished
        })
    );
}

export async function searchQuestion(req: Request, res: Response) {
    const { query } = z.object({
        query: z.string()
    }).parse(req.body);

    //who cares about formatting
    const questions = await prisma.$queryRaw`
        select
            "q"."id" as "questionId",
            "q"."data" ->> 'body' as "body",
            "c"."abbreviation" || "c"."number" as "course",
            "e"."season" || '-' || "e"."year" || '-' || case
            when "e"."number" = 0 then 'Final'
            else "e"."number" :: text
            end as "exam",
            jsonb_agg(distinct "ac") as "answerChoices",
            nullif(jsonb_agg(distinct "r"), '[null]') as "resources",
            array_remove(array_agg(distinct "topicals"."name"), NULL) as "topics"
        from
            "Question" as "q"
            inner join "Course" as "c" on "c"."id" = "q"."courseId"
            inner join "Exam" as "e" on "e"."id" = "q"."examId"
            inner join "AnswerChoice" as "ac" on "ac"."questionId" = "q"."id"
            left join "Resource" as "r" on "r"."questionId" = "q"."id"
            left join lateral (
                select
                    "t"."name"
                from
                    "Topic" as "t"
                    inner join "QuestionToTopic" as "qtt" on "qtt"."topicId" = "t"."id"
                where
                    "qtt"."questionId" = "q"."id"
            ) as "topicals" on (true)
        where
            "q"."bodyVector" @@ to_tsquery(${query})
                and "q"."flags" & 1 = 1
                group by
                "q"."id",
                "c"."abbreviation" || "c"."number",
                "e"."season" || '-' || "e"."year" || '-' || case
                when "e"."number" = 0 then 'Final'
                else "e"."number" :: text
                end;
    `

    res.status(200).send(questions);
}

export async function updateQuestion(req: Request, res: Response) {
    const options = UpdateQuestionOptions.parse(req.body);
    console.log(req.body.data)
    console.log(options.data);

    const question = await prisma.question.findFirstOrThrow({
        where: await Resolver.question(req.params),
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
            data: options.data,
            flags: options.flags ? FlagEncoder.question(options.flags) : options.flags,
            topics: upsertOrDisconnectTopics(
                question.id,
                question.courseId,
                question.topics.map((topic) => topic.topicId),
                options.topics
            ),
            resources: upsertResources(options.resources),
            answerChoices: upsertAnswerChoices(options.answerChoices),
            explanation: upsertExplanation(options.explanation)
        },
        include: FullQuestion
    });

    res.status(200).send(
        Formatter.question({
            data: updatedQuestion,
            sendUnpublished: req.sendUnpublished
        })
    );
}

export async function toggleQuestionPublished(req: Request, res: Response) {
    const question = await prisma.question.findFirstOrThrow({
        where: await Resolver.question(req.params),
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
        throw new APIError("Question not found", 404);
    }

    if (!question.exam.flags.published) {
        throw new APIError("Exam must be published", 409);
    }

    const status = !question.flags.published;

    await prisma.question.update({
        where: {
            id: question.id
        },
        data: {
            flags: FlagEncoder.question({
                ...question.flags,
                published: status
            })
        }
    });

    res.status(200).send({
        message: `Question is now ${status ? "published" : "unpublished"}`
    });
}

export async function deleteQuestion(req: Request, res: Response) {
    const question = await prisma.question.findFirstOrThrow({
        where: await Resolver.question(req.params)
    });

    await prisma.$transaction(async (prisma) => {
        // Delete the question
        await prisma.question.delete({
            where: {
                id: question.id
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
        throw new APIError(`AnswerChoice not found: ${answerChoice}`, 404);
    }

    res.status(200).send(answerChoice);
}

// Generalize any prisma call that should upsert Answer Choices
function upsertAnswerChoices(answerChoices?: z.infer<typeof UpsertAnswerChoiceOptions>[]) {
    return {
        upsert: answerChoices?.map((ac) => {
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

// Generalize any prisma call that should upsert Explanations
function upsertExplanation(explanation?: z.infer<typeof UpsertExplanationOptions>) {
    return explanation
        ? {
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
        }
        : explanation;
}
