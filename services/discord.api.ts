import type { Application, CourseRequest, Feedback } from "@prisma/client";
import axios from "axios";

export class DiscordAPI {
    public static async start() {
        await axios.post(`${process.env["DISCORD_URL"]}/start`);
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

    public static async reportError(error: Error, path: string, client: string, agent?: string, origin?: string) {
        try {
            await axios.post(`${process.env["DISCORD_URL"]}/error`, {
                error: {
                    ...error,
                    path: path,
                    agent: agent,
                    origin: origin,
                    client: client
                },
                env: process.env["NODE_ENV"],
                location: "BACKEND"
            });
        } catch {
            console.log("Unable to send error to Discord");
        }
    }
}
