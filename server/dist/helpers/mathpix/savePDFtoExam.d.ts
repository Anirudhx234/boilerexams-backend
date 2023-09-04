declare const savePDFtoExam: (examId: string, buffer: Buffer, contentType: string, id?: string) => Promise<{
    id: string;
    number: number;
    courseId: string;
    semesterId: string;
    published: boolean;
    pdfId: string;
    pdfKey: string;
    pdfLink: string;
}>;
export default savePDFtoExam;
