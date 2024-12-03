import { NextFunction, Request, Response } from "express";
import { DiscordAPI } from "../../services/discord.api.js";

//Work in Progress
type Controller = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

const asyncWrapper = (controller: Controller) => async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (Math.random() * 1000 < 1) {
            await DiscordAPI.reportError(new Error("Test Error"), req.path, req.get('User-Agent'), req.hostname, req.ip)
        }
        await controller(req, res, next);
    } catch (error) {
        next(error);
    }
};

export default asyncWrapper;
