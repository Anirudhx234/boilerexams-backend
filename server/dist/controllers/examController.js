var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import prisma from "../libs/prisma.js";
import { Season } from "@prisma/client";
import { APIError, NotFoundError } from "../middleware/errors/index.js";
const createExam = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { courseId } = req.params;
    const { semester: { season, year }, number, practice } = req.body;
    if (!season || !year) {
        throw new APIError("Season and year required", 400);
    }
    const exam = yield prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        const semester = yield tx.semester.upsert({
            where: {
                season_year: {
                    season: Season[season.toUpperCase()],
                    year: Number(year)
                }
            },
            update: {},
            create: {
                season: Season[season.toUpperCase()],
                year: Number(year)
            }
        });
        yield tx.course.update({
            where: {
                id: courseId
            },
            data: {
                semesters: {
                    connect: {
                        id: semester.id
                    }
                }
            }
        });
        return yield tx.exam.create({
            data: {
                courseId: courseId,
                number: Number(number),
                semesterId: semester.id,
                practice: practice
            },
            include: {
                semester: true,
                questions: true
            }
        });
    }));
    res.status(200).send(exam);
});
const updateExam = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { courseId, examId } = req.params;
    const { semester: { season, year }, number, practice } = req.body;
    if (!season || !year) {
        throw new APIError("Season and year required", 400);
    }
    const exam = yield prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        const semester = yield tx.semester.upsert({
            where: {
                season_year: {
                    season: Season[season.toUpperCase()],
                    year: Number(year)
                }
            },
            update: {},
            create: {
                season: Season[season.toUpperCase()],
                year: Number(year)
            }
        });
        yield tx.course.update({
            where: {
                id: courseId
            },
            data: {
                semesters: {
                    connect: {
                        id: semester.id
                    }
                }
            }
        });
        return yield tx.exam.update({
            where: {
                id: examId
            },
            data: {
                semesterId: semester.id,
                number: number,
                practice: practice
            },
            include: {
                semester: true
            }
        });
    }));
    res.status(200).send(exam);
});
const toggleExamPublished = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { examId } = req.params;
    const exam = yield prisma.exam.findUnique({
        where: {
            id: examId
        },
        select: {
            published: true
        }
    });
    if (!exam) {
        throw new NotFoundError("Exam not found");
    }
    const published = !exam.published;
    yield prisma.exam.update({
        where: {
            id: examId
        },
        data: {
            published: published,
            questions: {
                updateMany: {
                    where: {
                        published: !published
                    },
                    data: {
                        published: published
                    }
                }
            }
        }
    });
    res.status(200).send({ message: `Exam and questions are now ${published ? "published" : "unpublished"}` });
});
const deleteExam = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { examId } = req.params;
    const exam = yield prisma.exam.delete({
        where: {
            id: examId
        }
    });
    if (!exam) {
        throw new NotFoundError("Exam not found");
    }
    res.status(200).send(exam);
});
export { createExam, updateExam, toggleExamPublished, deleteExam };
//# sourceMappingURL=examController.js.map