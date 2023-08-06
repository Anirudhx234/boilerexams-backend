import { Request, Response, NextFunction } from "express"

const asyncWrapper = (controller) => async (req: Request, res: Response, next: NextFunction) => {
    try {
        await controller(req, res, next)
    } catch (error) {
        next(error)
    }
}

export default asyncWrapper