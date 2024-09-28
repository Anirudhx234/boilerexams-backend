import type { Application, CourseRequest, Feedback } from "@prisma/client";
import axios from "axios";

export class DiscordAPI {
    public static async createApplication(application: Application) {
        await axios.post(`${process.env["DISCORD_URL"]}/applications`, application);
    }

    public static async createFeedback(feedback: Feedback) {
        await axios.post(`${process.env["DISCORD_URL"]}/reports`, feedback);
    }

    public static async updateCourseRequests(courseRequests: CourseRequest[]) {
        await axios.post(`${process.env["DISCORD_URL"]}/course-requests`, courseRequests);
    }

    public static async reportError(error: Error, path: string) {
        try {
            await axios.post(`${process.env["DISCORD_URL"]}/error`, {
                error: {
                    ...error,
                    path: path
                },
                env: ["NODE_ENV"],
                location: "BACKEND"
            });
        } catch {
            console.log("Unable to send error to Discord");
        }
    }
}
