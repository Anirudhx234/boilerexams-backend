import { z } from "zod";
import { Epoch } from "../prisma/schema.js";
import { QuestionType } from "@prisma/client";
import type { Request, Response } from "express";
import prisma from "../prisma/prisma.js";
import Resolver from "../helpers/resolver.js";
import { NotFoundError } from "../middleware/errors/index.js";

export const MultipleChoiceSubmissionData = z.array(z.number());

export const FreeResponseSubmissionData = z.string().optional();

export const ShortAnswerSubmissionData = FreeResponseSubmissionData;

export const FillInBlankSubmissionData = FreeResponseSubmissionData;

export const UpdateSubmissionScheme = z.object({
    correct:        z.boolean().optional(),
    timeStarted:    z.coerce.date().min(Epoch).optional(),
    timeEnded:      z.coerce.date().refine(date => date < new Date()).optional(),
    timeSpent:      z.preprocess(coerceBigIntSafely, z.bigint()).optional(),
    timeSpentVideo: z.preprocess(coerceBigIntSafely, z.bigint()).optional(),
    timeSpentModal: z.preprocess(coerceBigIntSafely, z.bigint()).optional(),
});

export const CreateSubmissionScheme = z.object({
    type:           z.nativeEnum(QuestionType),
    userSolution:   z.union([
        MultipleChoiceSubmissionData,
        FreeResponseSubmissionData,
        ShortAnswerSubmissionData,
        FillInBlankSubmissionData
    ]),
    correct:        z.boolean(),
    timeStarted:    z.coerce.date().min(Epoch),
    timeEnded:      z.coerce.date().refine(date => date < new Date()),
    timeSpent:      z.preprocess(coerceBigIntSafely, z.bigint()),
    timeSpentVideo: z.preprocess(coerceBigIntSafely, z.bigint()),
    timeSpentModal: z.preprocess(coerceBigIntSafely, z.bigint()),
    osFamily:       z.string().optional(),
});

export async function createSubmission(req: Request, res: Response) {
    const { q, t, e, c } = req.params;
    const options = CreateSubmissionScheme.parse(req.body);

    const question = await prisma.question.findUnique({
        where: await Resolver.question(q, t, e, c)
    });

    if (!question) {
        throw new NotFoundError(`Question not found: ${q}`);
    }

    const submission = await prisma.submission.create({
        data: {
            ...options,
        },
        include: {
            question: true
        }
    });
    res.status(200).send(submission);
}

export async function batchCreateSubmission(req: Request, res: Response) {
    const options: z.infer<typeof CreateSubmissionScheme>[] = req.body.map((option: unknown) => {
        return CreateSubmissionScheme.parse(option);
    });

    const submissions = await prisma.$transaction(options.map((option) => {
        return prisma.submission.create({
            data: {
                ...option,
            },
        });
    }));

    res.status(200).send(submissions);
}

export async function updateSubmission(req: Request, res: Response) {
    const { submissionId } = req.params;
    const options = UpdateSubmissionScheme.parse(req.body);

    const submission = await prisma.submission.update({
        where: {
            id: submissionId,
        },
        data: {
            ...options
        },
    });

    res.status(200).send(submission);
}

function coerceBigIntSafely(input?: unknown) {
    if (!input) return;
    return BigInt(String(input));
}