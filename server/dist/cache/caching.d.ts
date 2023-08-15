import { Request, NextFunction } from "express";
declare const cache: (duration: any) => (req: Request, res: any, next: NextFunction) => void;
export default cache;
