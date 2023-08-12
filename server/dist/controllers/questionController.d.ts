import { Request, Response } from 'express';
declare const getQuestion: (req: Request, res: Response) => Promise<void>;
declare const createQuestion: (req: Request, res: Response) => Promise<void>;
declare const updateQuestion: (req: Request, res: Response) => Promise<void>;
declare const toggleQuestionPublished: (req: Request, res: Response) => Promise<void>;
declare const deleteQuestion: (req: Request, res: Response) => Promise<void>;
declare const createQuestionSubmission: (req: Request, res: Response) => Promise<void>;
declare const updateSubmission: (req: Request, res: Response) => Promise<void>;
export { getQuestion, createQuestion, updateQuestion, toggleQuestionPublished, deleteQuestion, createQuestionSubmission, updateSubmission };
