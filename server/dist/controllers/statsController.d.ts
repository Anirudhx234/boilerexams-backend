import { Request, Response } from 'express';
declare const getQuestionStats: (req: Request, res: Response) => Promise<void>;
declare const getExamStats: (req: Request, res: Response) => Promise<void>;
declare const getCourseStats: (req: Request, res: Response) => Promise<void>;
declare const getSubmissionStats: (req: Request, res: Response) => Promise<void>;
export { getQuestionStats, getExamStats, getCourseStats, getSubmissionStats };
