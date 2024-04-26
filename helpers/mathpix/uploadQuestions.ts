import { QuestionType, ResourceType } from "@prisma/client";
import axios from "axios";
import prisma from "../../prisma/prisma.js";
import uploadFileToS3 from "../../utils/uploadFileToS3.js";

const uploadQuestions = async (courseId: string, examId: string, questions: any[]) => {
    const promises: Promise<any>[] = [];
    for (const question of questions) {
        const index = questions.indexOf(question);
        const newQuestion = {
            number: index + 1,
            body: question[0].content
        };
        const tempResources = question[0].hasImage ? question[0].imageLinks : [];
        const questionResources = uploadResources(tempResources);
        question.shift();
        const answerChoices: any[] = [];

        for (const answerChoice of question) {
            const index1 = question.indexOf(answerChoice);
            const ac = {
                choiceIndex: index1,
                body: answerChoice.content
                //resources: [] as any
            };
            //resources = (answerChoice.hasImage) ? (answerChoice.imageLinks) : ([]),
            //ac.resources = await uploadResources(resources)
            answerChoices.push(ac);
        }

        promises.push(
            prisma.question.create({
                data: {
                    courseId: courseId,
                    examId: examId,
                    number: newQuestion.number,
                    type: QuestionType.MULTIPLE_CHOICE,
                    data: {
                        body: newQuestion.body,
                        answerChoices: answerChoices
                    },
                    resources: {
                        connect: questionResources?.map((id) => ({ id: id }))
                    },
                    flags: 0
                },
                include: {
                    submissions: true,
                    topics: true,
                    resources: true
                }
            })
        );
    }
    return await Promise.all(promises);
};

const uploadResources = (resources) => {
    const resourceIds: string[] = [];
    resources.forEach(async (resource) => {
        const image = await axios.get(resource, {
            responseType: "arraybuffer"
        });

        const contentType = image.headers["content-type"];

        const data = await uploadFileToS3(image.data, contentType);

        // ToDo make sure this works with new reoources
        const resp = await prisma.resource.create({
            data: {
                type: ResourceType.IMAGE,
                data: {
                    key: data.Key,
                    url: data.Location
                }
            }
        });
        resourceIds.push(resp.id);
    });
    if (resourceIds.length) {
        return resourceIds;
    }
    return undefined;
};

export default uploadQuestions;
