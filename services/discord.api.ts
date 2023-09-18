import {Application, CourseRequest, Report} from "@prisma/client";
import axios from "axios";

export class DiscordAPI {
    public static async createApplication(application: Application) {
        await axios.post(`${process.env.DISCORD_URL}/feedback/applications`, application);
    }

    public static async createReport(report: Report) {
        await axios.post(`${process.env.DISCORD_URL}/feedback/reports`, report);
    }

    public static async updateCourseRequests(courseRequests: CourseRequest[]) {
        await axios.post(`${process.env.DISCORD_URL}/feedback/course-requests`, courseRequests);
    }
}