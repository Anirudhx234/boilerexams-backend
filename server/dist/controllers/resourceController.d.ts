import { Request, Response } from 'express';
declare const getResource: (req: Request, res: Response) => Promise<void>;
declare const createImageResource: (req: Request, res: Response) => Promise<void>;
declare const createImageResourceFromLink: (req: Request, res: Response) => Promise<void>;
declare const createCodeResource: (req: Request, res: Response) => Promise<void>;
declare const updateCodeResource: (req: Request, res: Response) => Promise<void>;
declare const deleteResource: (req: Request, res: Response) => Promise<void>;
export { getResource, createImageResource, createImageResourceFromLink, createCodeResource, updateCodeResource, deleteResource };
