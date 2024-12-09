import type { Application, CourseRequest, Feedback } from "@prisma/client";
import axios from "axios";
import { Request } from "express";

export class DiscordAPI {
    public static async start() {
        await axios.post(`${process.env["DISCORD_URL"]}/start`, {
            env: process.env["NODE_ENV"]
        });
    }

    public static async stop(message: string, err?: Error) {
        await axios.post(`${process.env["DISCORD_URL"]}/stop`, {
            message: message,
            env: process.env["NODE_ENV"],
            error: err
        });
    }

    public static async createApplication(application: Application) {
        await axios.post(`${process.env["DISCORD_URL"]}/applications`, application);
    }

    public static async createFeedback(feedback: Feedback) {
        await axios.post(`${process.env["DISCORD_URL"]}/reports`, feedback);
    }

    public static async updateCourseRequests(courseRequests: CourseRequest[]) {
        await axios.post(`${process.env["DISCORD_URL"]}/course-requests`, courseRequests);
    }

    public static async reportError(error: Error, req: Request) {
        try {
            await axios.post(`${process.env["DISCORD_URL"]}/error`, {
                error: {
                    error: error,
                    request: req.method + ' ' + req.path,
                    body: req.body,
                    clientId: req.cookies["ClientId"],
                    agent: req.get('User-Agent'),
                    origin: req.get('origin'),
                },
                env: process.env["NODE_ENV"],
                location: "BACKEND"
            });
        } catch {
            console.log("Unable to send error to Discord");
        }
    }
}
