var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import prisma from "../../libs/prisma.js";
import { NotFoundError } from "../../middleware/errors/index.js";
import msToHMS from "../../utils/msToHMS.js";
const minimumValidSubmissionTime = 0;
const courseStats = (courseId) => __awaiter(void 0, void 0, void 0, function* () {
    const promises = [];
    const course = yield prisma.course.findFirst({
        where: {
            id: courseId,
            published: true
        },
        include: {
            _count: {
                select: {
                    exams: {
                        where: {
                            published: true
                        }
                    },
                    questions: {
                        where: {
                            published: true
                        }
                    }
                }
            }
        }
    });
    if (!course) {
        throw new NotFoundError("Course not found");
    }
    promises.push(prisma.submission.aggregate({
        where: {
            question: {
                courseId: courseId,
                published: true
            },
            timeSpent: {
                gte: minimumValidSubmissionTime
            }
        },
        _count: true,
        _sum: {
            timeSpent: true,
            timeSpentVideo: true,
        }
    }));
    promises.push(prisma.submission.aggregate({
        where: {
            question: {
                courseId: courseId,
                published: true
            },
            timeSpent: {
                gte: minimumValidSubmissionTime
            },
            correct: true
        },
        _count: true,
    }));
    const resolved = yield Promise.all(promises);
    const submissions = resolved[0];
    const correctSubmissions = resolved[1];
    const totalTimeSpent = msToHMS(submissions._sum.timeSpent);
    const totalVideoWatchTime = msToHMS(submissions._sum.timeSpentVideo);
    const courseStats = {
        courseName: course.name,
        courseId: courseId,
        totalExams: course._count.exams,
        totalQuestions: course._count.questions,
        totalTimeSpent: totalTimeSpent,
        totalVideoWatchTime: totalVideoWatchTime,
        totalSubmissions: submissions._count,
        totalCorrectSubmissions: correctSubmissions._count
    };
    return courseStats;
});
export default courseStats;
//# sourceMappingURL=courseStats.js.map