import { Request, Response } from 'express';
declare const parseFromFile: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
declare const parseFromLink: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
declare const getIdResults: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
declare const attachPDFToExam: (req: Request, res: Response) => Promise<void>;
export { parseFromFile, parseFromLink, getIdResults, attachPDFToExam };
