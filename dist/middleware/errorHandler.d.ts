import { Request, Response, NextFunction } from "express";
declare const errorHandler: (error: any, req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>>;
export default errorHandler;
