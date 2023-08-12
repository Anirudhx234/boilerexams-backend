import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import express from "express";
import _ from "lodash";
import asyncWrapper from "../middleware/wrappers/asyncWrapper.js";
import { NotFoundError } from "../middleware/errors/index.js";
import authHandler from "../middleware/auth/authHandler.js";

const prisma = new PrismaClient();
const app = express();

app.get("/id/courses/:courseId", authHandler, asyncWrapper(async (req: Request, res: Response) => {
	const { courseId } = req.params;
	const course = await prisma.course.findUnique({
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
	})

	if (!course) {
		throw new NotFoundError("Course not found")
	}
	return res.status(200).send(course);
}));

app.get("/id/courses/:courseId/topics", authHandler, asyncWrapper(async (req: Request, res: Response) => {
	const { courseId } = req.params;
	const course = await prisma.course.findUnique({
		where: {
			id: courseId,
		},
		select: {
			topics: true,
		},
	})
	if (!course) {
		throw new NotFoundError("Course not found")
	}
	return res.status(200).send(course.topics);
}));

app.get("/id/courses/:courseId/semesters", authHandler, asyncWrapper(async (req: Request, res: Response) => {
	const { courseId } = req.params;
	const course = await prisma.course.findUnique({
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
	})

	if (!course) {
		throw new NotFoundError("Course not found")
	}
	return res.status(200).send(course.semesters);
}));

app.get("/id/courses/:courseId/:semesterId/exams", authHandler, asyncWrapper(async (req: Request, res: Response) => {
	const { courseId, semesterId } = req.params;
	const exams = await prisma.exam.findMany({
		where: {
			courseId: courseId,
			semesterId: semesterId,
		},
		orderBy: {
			number: "asc",
		},
	})

	return res.status(200).send(exams);
}));

app.get("/id/exams/:examId", authHandler, asyncWrapper(async (req: Request, res: Response) => {
	const { examId } = req.params;
	const exam = await prisma.exam.findUnique({
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
	})

	if (!exam) {
		throw new NotFoundError("Exam not found")
	}
	return res.status(200).send(exam);
}));

app.get("/id/exams/:examId/questions", authHandler, asyncWrapper(async (req: Request, res: Response) => {
	const { examId } = req.params;
	const exam = await prisma.exam.findUnique({
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
	})

	if (!exam) {
		throw new NotFoundError("Exam not found")
	}
	return res.status(200).send(exam.questions);
}));

app.get("/id/courses/:courseId/:topicId/questions", authHandler, asyncWrapper(async (req: Request, res: Response) => {
	const { courseId, topicId } = req.params;
	const topic = await prisma.topic.findUnique({
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
	})

	if (!topic) {
		throw new NotFoundError("Topic not found")
	}
	return res.status(200).send(topic.questions);
}));

export default app;
