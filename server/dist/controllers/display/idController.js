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
const getCourse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { courseId } = req.params;
    const course = yield prisma.course.findUnique({
        where: {
            id: courseId,
        },
        include: {
            topics: true,
            exams: {
                include: {
                    semester: true,
                }
            },
        },
    });
    if (!course) {
        throw new NotFoundError("Course not found");
    }
    return res.status(200).send(course);
});
const getCourseTopics = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { courseId } = req.params;
    const course = yield prisma.course.findUnique({
        where: {
            id: courseId,
        },
        select: {
            topics: true,
        },
    });
    if (!course) {
        throw new NotFoundError("Course not found");
    }
    return res.status(200).send(course.topics);
});
const getCourseSemesters = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { courseId } = req.params;
    const course = yield prisma.course.findUnique({
        where: {
            id: courseId,
        },
        select: {
            semesters: {
                orderBy: {
                    year: "asc",
                },
            },
        },
    });
    if (!course) {
        throw new NotFoundError("Course not found");
    }
    return res.status(200).send(course.semesters);
});
const getCourseSemesterExams = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { courseId, semesterId } = req.params;
    const exams = yield prisma.exam.findMany({
        where: {
            courseId: courseId,
            semesterId: semesterId,
        },
        orderBy: {
            number: "asc",
        },
    });
    return res.status(200).send(exams);
});
const getExam = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { examId } = req.params;
    const exam = yield prisma.exam.findUnique({
        where: {
            id: examId,
        },
        include: {
            questions: {
                orderBy: {
                    number: "asc",
                },
                include: {
                    topics: true,
                    answerChoices: {
                        orderBy: {
                            choiceIndex: "asc",
                        },
                        include: {
                            resources: {
                                include: {
                                    image: true,
                                    code: true,
                                },
                            },
                        },
                    },
                    resources: {
                        include: {
                            image: true,
                            code: true,
                        },
                    },
                },
            },
            semester: true,
        },
    });
    if (!exam) {
        throw new NotFoundError("Exam not found");
    }
    return res.status(200).send(exam);
});
const getExamQuestions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { examId } = req.params;
    const exam = yield prisma.exam.findUnique({
        where: {
            id: examId,
        },
        select: {
            questions: {
                orderBy: {
                    number: "asc",
                },
            },
        },
    });
    if (!exam) {
        throw new NotFoundError("Exam not found");
    }
    return res.status(200).send(exam.questions);
});
const getCourseTopicQuestions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { courseId, topicId } = req.params;
    const topic = yield prisma.topic.findUnique({
        where: {
            id: topicId,
        },
        select: {
            questions: {
                where: {
                    id: courseId,
                },
            },
        },
    });
    if (!topic) {
        throw new NotFoundError("Topic not found");
    }
    return res.status(200).send(topic.questions);
});
export { getCourse, getCourseTopics, getCourseSemesters, getCourseSemesterExams, getExam, getExamQuestions, getCourseTopicQuestions };
//# sourceMappingURL=idController.js.map