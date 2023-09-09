import prisma from "../../libs/prisma.js";
import uploadFileToS3 from '../../utils/uploadFileToS3.js';

const savePDFtoExam = async (examId: string, buffer: Buffer, contentType: string, id?: string) => {
    const data = await uploadFileToS3(buffer, contentType);

    return await prisma.exam.update({
        where: {
            id: examId
        },
        data: {
            pdfId: id,
            pdfKey: data.Key,
            pdfLink: data.Location
        }
    })
}

export default savePDFtoExam