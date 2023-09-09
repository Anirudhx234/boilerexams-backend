import prisma from "../../libs/prisma.js";
import { Request, Response } from "express";
import { NotFoundError } from "../../middleware/errors/index.js";

const getCourse = async (req: Request, res: Response) => {
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
};

const getCourseTopics = async (req: Request, res: Response) => {
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
};

const getCourseSemesters = async (req: Request, res: Response) => {
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
};

const getCourseSemesterExams = async (req: Request, res: Response) => {
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
};

const getExam = async (req: Request, res: Response) => {
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
};

const getExamQuestions = async (req: Request, res: Response) => {
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
};

const getCourseTopicQuestions = async (req: Request, res: Response) => {
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
};

export {
    getCourse,
    getCourseTopics,
    getCourseSemesters,
    getCourseSemesterExams,
    getExam,
    getExamQuestions,
    getCourseTopicQuestions
};
