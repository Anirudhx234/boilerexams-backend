import { Application, CourseRequest, Report, VideoFeedback } from "@prisma/client";
import axios from "axios";

export class DiscordAPI {
    public static async createApplication(application: Application) {
        await axios.post(`${process.env.DISCORD_URL}/applications`, application);
    }

    public static async createReport(report: Report) {
        await axios.post(`${process.env.DISCORD_URL}/reports`, report);
    }

    public static async createVideoFeedback(videoFeedback: VideoFeedback[]) {
        await axios.post(`${process.env.DISCORD_URL}/video-feedback`, videoFeedback);
    }

    public static async updateCourseRequests(courseRequests: CourseRequest[]) {
        await axios.post(`${process.env.DISCORD_URL}/course-requests`, courseRequests);
    }
}