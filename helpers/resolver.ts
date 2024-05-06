import { Request } from "express";
import { Season } from "@prisma/client";
import { string, z } from "zod";
import prisma from "../prisma/prisma.js";
import APIError from "../middleware/errors/APIError.js";

export interface ParamsDictionary {
    [key: string]: string;
}

export const CourseResolvable = z.union([
    z.object({
        id: z.string().uuid()
    }),
    z.object({
        abbreviation_number: z.object({
            abbreviation: z.string(),
            number: z.number().min(10000).max(99999)
        })
    })
]);

export const ExamResolvable = z.union([
    z.object({
        id: z.string().uuid()
    }),
    z.object({
        number_year_season_courseId: z.object({
            number: z.number().min(0).max(5),
            year: z.number().min(1970).max(2070),
            season: z.nativeEnum(Season),
            courseId: z.string().uuid()
        })
    })
]);

export const CustomExamResolvable = z.union([
    z.object({
        id: string().uuid()
    }),
    z.object({
        name_courseId: z.object({
            name: z.string(),
            courseId: z.string().uuid()
        })
    })
])

export const TopicResolvable = z.union([
    z.object({
        id: z.string().uuid()
    }),
    z.object({
        name_courseId: z.object({
            name: z.string(),
            courseId: z.string().uuid()
        })
    })
]);

export const QuestionResolvable = z.union([
    z.object({
        id: z.string().uuid()
    }),
    z.object({
        number: z.number().min(1),
        examId: z.string().uuid(),
        parentId: z.string().uuid().nullable().default(null)
    })
]);

const CourseParams = z.object({
    course: z.string()
});

export default class Resolver {
    private static uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i; // uuid
    private static abbreviationNumberRegex = /^([a-zA-Z]+)([1-9]\d{4})$/; // ABC10000
    private static numberYearSeasonRegex = /^([a-zA-Z]+)-(\d{4})-(\d)$/; // Spring-1970-1

    // Resolve a Course from either id or abbreviation_number
    public static course(params: ParamsDictionary) {
        const { course } = params;
        if (Resolver.uuidRegex.test(course)) {
            // If input matches UUIDv4, return object with id and null for abbreviation and number
            return CourseResolvable.parse({
                id: course
            });
        }

        if (Resolver.abbreviationNumberRegex.test(course)) {
            // If input matches abbreviation + number, extract parts and return object
            const matches = course.match(Resolver.abbreviationNumberRegex);
            const abbreviation = matches?.at(1);
            const number = Number(matches?.at(2));

            return CourseResolvable.parse({
                abbreviation_number: {
                    abbreviation: abbreviation,
                    number: number
                }
            });
        }

        throw new APIError(`Course could not be parsed: ${course}`, 400);
    }

    // Resolve an Exam from either id or number_year_season and course
    public static async exam(params: ParamsDictionary) {
        const { exam, course } = params;
        if (Resolver.uuidRegex.test(exam)) {
            // If input matches UUIDv4, return object with id and null for abbreviation and number
            return ExamResolvable.parse({
                id: exam
            });
        }

        if (Resolver.numberYearSeasonRegex.test(exam) && course) {
            // If input matches "Spring-2022-Final" format, extract parts and return object
            const matches = exam.match(Resolver.numberYearSeasonRegex);
            const season = matches?.[1];
            const year = Number(matches?.[2]);
            const number = matches?.[3].toLowerCase() === "final" ? 0 : matches?.[3];

            const course = await prisma.course.findUnique({
                where: Resolver.course(params)
            });

            if (!course) {
                throw new APIError(`Course not found ${course}`, 404);
            }

            return ExamResolvable.parse({
                number_year_season_courseId: {
                    number: isNaN(Number(number)) ? 0 : Number(number),
                    year: year,
                    season: season?.toUpperCase(),
                    courseId: course.id
                }
            });
        }

        throw new APIError(`Exam could not be parsed: ${exam} ${course}`, 400);
    }

    // Resolve a CustomExam from either id or name and course
    public static async customExam(params: ParamsDictionary) {
        const { customExam, course } = params;
        if (Resolver.uuidRegex.test(customExam)) {
            // If input matches UUIDv4, return object with id and null for abbreviation and number
            return CustomExamResolvable.parse({
                id: customExam
            });
        }

        if (course) {
            const name = customExam;

            const course = await prisma.course.findUnique({
                where: Resolver.course(params)
            });

            if (!course) {
                throw new APIError(`Course not found ${course}`, 404);
            }

            return CustomExamResolvable.parse({
                name_courseId: {
                    name: name,
                    courseId: course.id
                }
            });
        }

        throw new APIError(`CustomExam could not be parsed: ${customExam} ${course}`, 400);
    }
    // Resolve a Topic from either id or name and course
    public static async topic(params: ParamsDictionary) {
        const { topic, course } = params;
        if (Resolver.uuidRegex.test(topic)) {
            // If input matches UUIDv4, return object with id and null for abbreviation and number
            return TopicResolvable.parse({
                id: topic
            });
        }

        if (course) {
            const name = topic;

            const course = await prisma.course.findUnique({
                where: Resolver.course(params)
            });

            if (!course) {
                throw new APIError(`Course not found ${course}`, 404);
            }

            return TopicResolvable.parse({
                name_courseId: {
                    name: name,
                    courseId: course.id
                }
            });
        }

        throw new APIError(`Topic could not be parsed: ${topic} ${course}`, 400);
    }

    // Resolve a Question from either id or number and Exam
    public static async question(params: ParamsDictionary) {
        const { question, topic, exam, course } = params;
        if (Resolver.uuidRegex.test(question)) {
            return QuestionResolvable.parse({
                id: question
            });
        }

        if (topic) {
            const topic = await prisma.topic.findUnique({
                where: await Resolver.topic(params)
            });

            if (!topic) {
                throw new APIError(`Topic not found ${topic}`, 404);
            }

            const questionToTopic = await prisma.questionToTopic.findUnique({
                where: {
                    number_topicId: {
                        number: Number(question),
                        topicId: topic.id
                    }
                }
            });

            if (!questionToTopic) {
                throw new APIError(`Question ${question} does not belong to topic ${topic}`, 404);
            }

            return QuestionResolvable.parse({
                id: questionToTopic.questionId
            });
        }

        if (exam) {
            const exam = await prisma.exam.findUnique({
                where: await Resolver.exam(params)
            });

            if (!exam) {
                throw new APIError(`Exam not found ${exam}`, 404);
            }

            return QuestionResolvable.parse({
                number: Number.parseInt(question),
                examId: exam.id
            });
        }

        throw new APIError(`Question could not be parsed: ${question} ${exam} ${course}`, 400);
    }
}
