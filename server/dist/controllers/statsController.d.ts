import { Request, Response } from 'express';
declare const getGeneralStats: (req: Request, res: Response) => Promise<void>;
declare const getCourseStats: (req: Request, res: Response) => Promise<void>;
declare const getCourseExamsStats: (req: Request, res: Response) => Promise<void>;
declare const getExamStats: (req: Request, res: Response) => Promise<void>;
declare const getQuestionStats: (req: Request, res: Response) => Promise<void>;
declare const getSubmissionStats: (req: Request, res: Response) => Promise<void>;
export { getGeneralStats, getCourseExamsStats, getQuestionStats, getExamStats, getCourseStats, getSubmissionStats };
