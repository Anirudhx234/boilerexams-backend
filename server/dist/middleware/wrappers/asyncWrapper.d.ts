import { Request, Response, NextFunction } from "express";
declare const asyncWrapper: (controller: any) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
export default asyncWrapper;
