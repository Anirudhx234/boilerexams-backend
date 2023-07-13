import {InvalidCourseError} from "../middleware/errors";

const axios = require("axios");

type PurdueIoCourse = { Id: string, Number: string, SubjectId: string, Title: string, CreditHours: number, Description: string };
type PurdueIoSubject = { Id: string, Name: string, Abbreviation: string };

export class PurdueIoAPI {
    public static async getCourse(abbreviation: string, number: string) {
        const query = `https://api.purdue.io/odata/Courses?$filter=Subject/Abbreviation eq '${abbreviation}' and Number eq '${number}'`;
        const request = await axios.get(query);
        const course = request.data.value[0] as PurdueIoCourse;
        if (!course) throw new InvalidCourseError(`Invalid Course ${abbreviation} ${number}`);
        return course;
    }

    public static async getSubject(abbreviation: string) {
        const query = `https://api.purdue.io/odata/Subjects?$filter=Abbreviation eq '${abbreviation}'`;
        const request = await axios.get(query);
        const subject = request.data.value[0] as PurdueIoSubject;
        if (!subject) throw new InvalidCourseError(`Invalid Subject ${abbreviation}`);
        return subject;
    }
}