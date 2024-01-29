import { NextFunction, Request, Response } from "express";

//Work in Progress
type Controller = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

const asyncWrapper = (controller: Controller) => async (req: Request, res: Response, next: NextFunction) => {
    try {
        await controller(req, res, next);
    } catch (error) {
        next(error);
    }
};

export default asyncWrapper;
