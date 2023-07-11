import axios from "axios";

type PurdueIoCourse = { Id: string,  Number: string, SubjectId: string, Title: string, CreditHours: number, description: string };
type PurdueIoSubject = { Id: string, Name: string, Abbreviation: string };

export class PurdueIoAPI {
    public static async getCourse(subject: string, number: string) {
        try {
            const query = `https://api.purdue.io/odata/Courses?$filter=Subject/Abbreviation eq '${subject}' and Number eq '${number}'`;
            const request = await axios.get(query);
            return request.data.value[0] as PurdueIoCourse;
        } catch {
            return null;
        }
    }

    public static async getSubject(abbreviation: string) {
        try {
            const query = `https://api.purdue.io/odata/Subjects?$filter=Abbreviation eq '${abbreviation}'`;
            const request = await axios.get(query);
            return request.data.value[0] as PurdueIoSubject;
        } catch {
            return null;
        }
    }
}