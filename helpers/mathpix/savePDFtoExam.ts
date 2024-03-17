import uploadFileToS3 from "../../utils/uploadFileToS3.js";

const savePDFtoExam = async (examId: string, buffer: Buffer, contentType: string, id?: string) => {
    const data = await uploadFileToS3(buffer, contentType);

    /* ToDo Rework this logic
        const resource = await prisma.resource.upsert({
            where: {
                examId: examId
            },
            create :{
                type: ResourceType.EXAM_PDF,
                data: {
                    key: data.Key,
                    url: data.Location
                }
            },
            update: {
                data: {
                    key: data.Key,
                    url: data.Location
                }
            },
            include: {
                exam: true
            }
        });

        return {
            ...resource.exam,
            pdf: resource
        };
    };

    /*
            data: {
                pdfId: id,
                pdfKey: data.Key,
                pdfLink: data.Location,
            },
     */
};

export default savePDFtoExam;
