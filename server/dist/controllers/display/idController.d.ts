import { Request, Response } from "express";
declare const getCourse: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
declare const getCourseTopics: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
declare const getCourseSemesters: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
declare const getCourseSemesterExams: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
declare const getExam: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
declare const getExamQuestions: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
declare const getCourseTopicQuestions: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export { getCourse, getCourseTopics, getCourseSemesters, getCourseSemesterExams, getExam, getExamQuestions, getCourseTopicQuestions };
