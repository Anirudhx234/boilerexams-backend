import { z } from "zod";
import { QuestionType } from "@prisma/client";
import type { Request, Response } from "express";
import prisma from "../prisma/prisma.js";
import Resolver from "../helpers/resolver.js";
import { Epoch } from "../prisma/schema.js";
import { QuestionData } from "./questionController.js";

export const MultipleChoiceSubmissionData = z.array(z.number());

export const FreeResponseSubmissionData = z.string().optional();

export const ShortAnswerSubmissionData = FreeResponseSubmissionData;

export const FillInBlankSubmissionData = FreeResponseSubmissionData;

export const ParentSubmissionData = z.array(
    z.object({
        id: z.string().uuid(),
        userSolution: z.union([
            MultipleChoiceSubmissionData,
            FreeResponseSubmissionData,
            ShortAnswerSubmissionData,
            FillInBlankSubmissionData,
        ]),
    }),
);

export const UpsertSubmissionOptions = z.object({
    timeStarted: z.coerce.date().min(Epoch).optional(),
    timeEnded: z.coerce
        .date()
        .refine((date) => date < new Date())
        .optional(),
    timeSpent: z.preprocess(coerceBigIntSafely, z.bigint().optional()),
    timeSpentVideo: z.preprocess(coerceBigIntSafely, z.bigint().optional()),
    timeSpentModal: z.preprocess(coerceBigIntSafely, z.bigint().optional()),
});

export const CreateSubmissionOptions = z.object({
    type: z.nativeEnum(QuestionType),
    questionId: z.string().uuid(),
    userSolution: z.union([
        ParentSubmissionData,
        MultipleChoiceSubmissionData,
        FreeResponseSubmissionData,
        ShortAnswerSubmissionData,
        FillInBlankSubmissionData,
    ]),
    timeStarted: z.coerce.date().min(Epoch),
    timeEnded: z.coerce.date().refine((date) => date < new Date()),
    timeSpent: z.preprocess(coerceBigIntSafely, z.bigint()),
    timeSpentVideo: z.preprocess(coerceBigIntSafely, z.bigint().default(0n)),
    timeSpentModal: z.preprocess(coerceBigIntSafely, z.bigint().default(0n)),
    osFamily: z.string().optional(),
});

export async function createSubmission(req: Request, res: Response) {
    const options = CreateSubmissionOptions.parse(req.body);

    const question = await prisma.question.findFirstOrThrow({
        where: {
            id: options.questionId
        },
    });

    const data = QuestionData.parse(question.data);
    const correct = checkUserSolution(question.type, options.userSolution, data.solution);

    const submission = await prisma.submission.create({
        data: {
            ...options,
            type: question.type,
            correct: correct,
            questionId: question.id,
        },
        include: {
            question: true,
        },
    });

    res.status(200).send(submission);
}

export async function batchCreateSubmission(req: Request, res: Response) {
    const options: z.infer<typeof CreateSubmissionOptions>[] = req.body.map((option: unknown) => {
        return CreateSubmissionOptions.parse(option);
    });

    const submissions = await prisma.$transaction(async (prisma) => {
        const submissionPromises = options.map(async (option) => {
            const question = await prisma.question.findUniqueOrThrow({
                where: {
                    id: option.questionId,
                },
            });
            const data = QuestionData.parse(question.data);
            const correct = checkUserSolution(question.type, option.userSolution, data);

            return prisma.submission.create({
                data: {
                    ...option,
                    type: question.type,
                    correct: correct,
                    questionId: question.id,
                },
                include: {
                    question: true,
                },
            });
        });

        return await Promise.all(submissionPromises);
    });

    res.status(200).send(submissions);
}

export async function upsertSubmission(req: Request, res: Response) {
    const { submissionId } = req.params;
    const options = UpsertSubmissionOptions.parse(req.body);

    const submission = await prisma.submission.update({
        where: {
            id: submissionId,
        },
        data: {
            ...options,
        },
    });

    res.status(200).send(submission);
}

function checkUserSolution(type: QuestionType, userSolution?: unknown, solution?: unknown) {
    switch (type) {
        case QuestionType.MULTIPLE_CHOICE:
            {
                const parsedUserSolution = z.array(z.number()).parse(userSolution);
                const parseSolution = z.array(z.number()).parse(solution);
                if (parsedUserSolution.length < 1) return false;
                for (const entry of parsedUserSolution) {
                    if (parseSolution.includes(entry)) continue;
                    return false;
                }
            }
            break;

        case QuestionType.SHORT_ANSWER:
            {
                const parsedUserSolution = z.string().parse(userSolution);
                const parsedSolution = z.string().parse(solution);
                if (parsedUserSolution.length < 1) return false;
                if (parsedUserSolution != parsedSolution || parsedUserSolution) return false;
            }
            break;

        default: {
            return false;
        }
    }

    return true;
}

function coerceBigIntSafely(input?: unknown) {
    if (!input) return;
    return BigInt(String(input));
}
