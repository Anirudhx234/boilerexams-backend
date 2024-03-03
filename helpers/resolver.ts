import { CourseResolvable, ExamResolvable, QuestionResolvable } from "../prisma/schema.js";
import { APIError } from "../middleware/errors/index.js";
import prisma from "../libs/prisma.js";


export default class Resolver {
    private static uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i; // uuid
    private static abbreviationNumberRegex = /^([a-zA-Z]+)([1-9]\d{4})$/; // ABC10000
    private static numberYearSeasonRegex = /^([a-zA-Z]+)-(\d{4})-(\d)$/; // Spring-1970-1

    // Resolve a Course from either id or abbreviation_number
    public static course(courseResolvable: string) {
        if (Resolver.uuidRegex.test(courseResolvable)) {
            // If input matches UUIDv4, return object with id and null for abbreviation and number
            return CourseResolvable.parse({
                id: courseResolvable
            });
        }

        if (Resolver.abbreviationNumberRegex.test(courseResolvable)) {
            // If input matches abbreviation + number, extract parts and return object
            const matches = courseResolvable.match(Resolver.abbreviationNumberRegex);
            const abbreviation = matches?.at(1);
            const number = Number(matches?.at(2));

            return CourseResolvable.parse({
                abbreviation_number: {
                    abbreviation: abbreviation,
                    number: number
                }
            });
        }

        throw new APIError(`CourseResolvable could not be parsed: ${courseResolvable}`, 400);
    }

    // Resolve an Exam from either id or number_year_season_courseId
    public static async exam(examResolvable: string, courseResolvable?: string) {
        if (Resolver.uuidRegex.test(examResolvable)) {
            // If input matches UUIDv4, return object with id and null for abbreviation and number
            return ExamResolvable.parse({
                id: examResolvable
            });
        }

        if (Resolver.numberYearSeasonRegex.test(examResolvable) && courseResolvable) {
            // If input matches "Spring-2022-Final" format, extract parts and return object
            const matches = examResolvable.match(Resolver.numberYearSeasonRegex);
            const season = matches?.[1];
            const year = Number(matches?.[2]);
            const number = matches?.[3].toLowerCase() === 'final' ? 0 : matches?.[3];

            const course = await prisma.course.findUnique({
                where: Resolver.course(courseResolvable)
            });

            if (!course) {
                throw new APIError(`Course not found ${courseResolvable}`, 404);
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

        throw new APIError(`ExamResolvable could not be parsed: ${examResolvable} ${courseResolvable}`, 400);
    }

    // Resolve a Question from either id or number_examId and ExamResolvable/CourseResolvable
    public static async question(questionResolvable: string, examResolvable?: string, courseResolvable?: string) {
        if (Resolver.uuidRegex.test(questionResolvable)) {
            return QuestionResolvable.parse({
                id: questionResolvable
            });
        }

        if (examResolvable) {
            const exam = await prisma.exam.findUnique({
                where: await Resolver.exam(examResolvable, courseResolvable)
            });

            if (!exam) {
                throw new APIError(`Exam not found ${examResolvable}`, 404);
            }

            return QuestionResolvable.parse({
                number: Number.parseInt(questionResolvable),
                examId: exam.id
            });
        }

        throw new APIError(`QuestionResolvable could not be parsed: ${questionResolvable} ${examResolvable} ${courseResolvable}`, 400);
    }
}