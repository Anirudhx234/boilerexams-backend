import type { Request, Response } from "express";
import { QuestionType } from "@prisma/client";
import { z } from "zod";
import prisma from "../prisma/prisma.js";
import { Epoch } from "../prisma/schema.js";
import { NumericalData, QuestionData } from "./questionController.js";

export const MultipleChoiceSubmissionData = z.array(z.number());

export const FreeResponseSubmissionData = z.boolean().optional();

export const ShortAnswerSubmissionData = z.string().optional();

export const FillInBlankSubmissionData = z.array(z.string());

export const NumericalSubmissionData = z.number().optional();

export const ParentSubmissionData = z.array(
    z.object({
        id: z.string().uuid(),
        userSolution: z.union([
            MultipleChoiceSubmissionData,
            FreeResponseSubmissionData,
            ShortAnswerSubmissionData,
            FillInBlankSubmissionData,
            NumericalSubmissionData
        ])
    })
);

export const UpdateSubmissionOptions = z.object({
    id: z.string().uuid().optional(),
    timeSpentVideo: z.preprocess(coerceBigIntSafely, z.bigint().optional()),
    timeSpentModal: z.preprocess(coerceBigIntSafely, z.bigint().optional())
});

export const CreateSubmissionOptions = z
    .object({
        id: z.string().uuid().optional(),
        type: z.nativeEnum(QuestionType),
        questionId: z.string().uuid(),
        userSolution: z.union([
            ParentSubmissionData,
            MultipleChoiceSubmissionData,
            FreeResponseSubmissionData,
            ShortAnswerSubmissionData,
            FillInBlankSubmissionData,
            NumericalSubmissionData
        ]),
        timeStarted: z.coerce.date().min(Epoch, "value too old"),
        timeEnded: z.coerce.date(),
        timeSpent: z.preprocess(coerceBigIntSafely, z.bigint()),
        timeSpentVideo: z.preprocess(coerceBigIntSafely, z.bigint().default(0n)),
        timeSpentModal: z.preprocess(coerceBigIntSafely, z.bigint().default(0n)),
        osFamily: z.string().optional()
    })
    .refine((options) => {
        const difference = options.timeEnded.getTime() - options.timeStarted.getTime();
        return difference >= options.timeSpent;
    }, "timeSpent did not exceed difference between timeStarted and timeEnded");

export async function createSubmission(req: Request, res: Response) {
    const options = CreateSubmissionOptions.parse(req.body);

    const question = await prisma.question.findFirstOrThrow({
        where: {
            id: options.questionId
        }
    });

    const data = QuestionData.parse(question.data);
    const correct = await checkUserSolution(question.type, options.userSolution, data.solution);

    const submission = await prisma.submission.create({
        data: {
            ...options,
            type: question.type,
            correct: correct,
            questionId: question.id
        },
        include: {
            question: true
        }
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
                    id: option.questionId
                }
            });
            const data = QuestionData.parse(question.data);
            const correct = await checkUserSolution(question.type, option.userSolution, data.solution);

            return prisma.submission.create({
                data: {
                    ...option,
                    type: question.type,
                    correct: correct,
                    questionId: question.id
                },
                include: {
                    question: true
                }
            });
        });

        return await Promise.all(submissionPromises);
    });

    res.status(200).send(submissions);
}

export async function updateSubmission(req: Request, res: Response) {
    const { submissionId } = req.params;
    const options = UpdateSubmissionOptions.parse(req.body);

    const submission = await prisma.submission.update({
        where: {
            id: submissionId
        },
        data: {
            ...options
        }
    });

    res.status(200).send(submission);
}

async function checkUserSolution(type: QuestionType, userSolution?: unknown, solution?: unknown) {
    switch (type) {
        case QuestionType.MULTIPLE_CHOICE:
            {
                const parsedUserSolution = MultipleChoiceSubmissionData.parse(userSolution);
                const parseSolution = z.array(z.number()).parse(solution);
                if (parsedUserSolution.length < 1) return false;
                for (const entry of parsedUserSolution) {
                    if (parseSolution.includes(entry)) continue;
                    return false;
                }
                break;
            }

        case QuestionType.SHORT_ANSWER:
            {
                const parsedUserSolution = ShortAnswerSubmissionData.parse(userSolution);
                const parsedSolution = ShortAnswerSubmissionData.parse(solution);
                if (!parsedUserSolution || parsedUserSolution.length < 1) return false;
                if (parsedUserSolution != parsedSolution) return false;
                break;
            }

        case QuestionType.FILL_IN_BLANK:
            {
                const parsedUserSolution = FillInBlankSubmissionData.parse(userSolution);
                const parsedSolution = FillInBlankSubmissionData.parse(solution);

                for (let i = 0; i < parsedSolution.length; i++) {
                    const values = parsedSolution[i].split("|");
                    if (!values.includes(parsedUserSolution[i])) {
                        return false;
                    }
                }
                break;
            }

        case QuestionType.FREE_RESPONSE: {
            const parsedUserSolution = FreeResponseSubmissionData.parse(userSolution);
            if (!parsedUserSolution) return false; // yeah, I know
            break;
        }

        case QuestionType.PARENT: {
            const parsedUserSolution = ParentSubmissionData.parse(userSolution);
            for (const childSolution of parsedUserSolution) {
                const child = await prisma.question.findUniqueOrThrow({
                    where: {
                        id: childSolution.id
                    }
                })
                const questionData = QuestionData.parse(child.data);
                const correct = await checkUserSolution(child.type, childSolution.userSolution, questionData.solution);
                if (!correct) return false;
            }
            break;
        }

        case QuestionType.NUMERICAL: {
            const parsedUserSolution = NumericalSubmissionData.parse(userSolution);
            const parsedSolution = NumericalSubmissionData.parse(solution);
            if (!parsedUserSolution || !parsedSolution) return false;
            const questionData = QuestionData.parse(parsedSolution);
            const numData = NumericalData.safeParse(questionData);
            if (numData.success) {
                const errorVal = numData.data.errorValue;
                const sigfigs = numData.data.sigfigs;
                if (Math.abs(parsedSolution - parsedUserSolution) < errorVal) return false;
                if (sigfigs && !(getSignificantDigitCount(parsedUserSolution) == sigfigs)) return false;
            }
            break;
        }

        default: {
            return false;
        }
    }

    return true;
}

function coerceBigIntSafely(input?: unknown) {
    if (input == undefined) return;
    return BigInt(String(input));
}

function getSignificantDigitCount(n) {
    if (n == undefined) return;
    n = Math.abs(n.toString().replace(".", "")); //remove decimal and make positive
    if (n == 0) return 0;
    while (n != 0 && n % 10 == 0) n /= 10; //kill the 0s at the end of n

    return Math.floor(Math.log(n) / Math.log(10)) + 1; //get number of digits
}
