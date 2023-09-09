import { Request, Response } from 'express';
declare const createExam: (req: Request, res: Response) => Promise<void>;
declare const updateExam: (req: Request, res: Response) => Promise<void>;
declare const toggleExamPublished: (req: Request, res: Response) => Promise<void>;
declare const deleteExam: (req: Request, res: Response) => Promise<void>;
export { createExam, updateExam, toggleExamPublished, deleteExam };
