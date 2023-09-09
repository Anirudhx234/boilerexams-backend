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
export declare class PurdueIoAPI {
    static getCourse(subject: PurdueIoSubject, number: string): Promise<PurdueIoCourse>;
    static getSubject(abbreviation: string): Promise<PurdueIoSubject>;
    static getCurrentTerm(): Promise<PurdueIoTerm>;
}
