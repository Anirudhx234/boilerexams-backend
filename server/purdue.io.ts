import axios from "axios";

type PurdueIoCourse = { Id: string,  Number: string, SubjectId: string, Title: string, CreditHours: number, description: string };

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
}