import APIError from "../middleware/errors/APIError.js";
import axios from "axios";

export type PurdueIoCourse = {
    Id: string;
    Number: string;
    SubjectId: string;
    Title: string;
    CreditHours: number;
    Description: string;
};
export type PurdueIoSubject = {
    Id: string;
    Name: string;
    Abbreviation: string;
};
export type PurdueIoTerm = {
    Id: string;
    Code: string;
    Name: string;
    StartDate: string;
    EndDate: string;
};

export class PurdueIoAPI {
    public static async getCourse(subject: PurdueIoSubject, number: number) {
        const query = `https://api.purdue.io/odata/Courses?$filter=Subject/Abbreviation eq '${subject.Abbreviation}' and Number eq '${number}'`;
        const request = await axios.get(query);
        const course = request.data.value[0] as PurdueIoCourse;
        if (!course) throw new APIError(`Invalid Course ${subject.Abbreviation} ${number}`, 400);
        return course;
    }

    public static async getSubject(abbreviation: string) {
        const query = `https://api.purdue.io/odata/Subjects?$filter=Abbreviation eq '${abbreviation}'`;
        const request = await axios.get(query);
        const subject = request.data.value[0] as PurdueIoSubject;
        if (!subject) throw new APIError(`Invalid Subject ${abbreviation}`, 400);
        return subject;
    }

    public static async getCurrentTerm() {
        const query = `https://api.purdue.io/odata/Terms?$orderby=EndDate asc`;
        const request = await axios.get(query);
        const terms = request.data.value as PurdueIoTerm[];
        const term = terms.find((element) => {
            const now = Date.now();
            const date = Date.parse(element.EndDate);
            return now < date;
        }) as PurdueIoTerm;
        if (!term) throw new APIError(`Could Not Find Current Term`, 404);
        return term;
    }
}
