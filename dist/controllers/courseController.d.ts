import { Request, Response } from 'express';
declare const createCourse: (req: Request, res: Response) => Promise<void>;
declare const updateCourse: (req: Request, res: Response) => Promise<void>;
declare const toggleCoursePublished: (req: Request, res: Response) => Promise<void>;
declare const deleteCourse: (req: Request, res: Response) => Promise<void>;
export { createCourse, updateCourse, toggleCoursePublished, deleteCourse };
