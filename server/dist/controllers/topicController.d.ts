import { Request, Response } from 'express';
declare const createTopic: (req: Request, res: Response) => Promise<void>;
declare const updateTopic: (req: Request, res: Response) => Promise<void>;
declare const deleteTopic: (req: Request, res: Response) => Promise<void>;
export { createTopic, updateTopic, deleteTopic };
