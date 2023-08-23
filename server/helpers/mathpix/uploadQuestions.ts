import { PrismaClient, ResourceType } from '@prisma/client'
import axios from "axios";
import uploadFileToS3 from '../../utils/uploadFileToS3.js';

const prisma = new PrismaClient()

const uploadQuestions = async (courseId: string, examId: string, questions: any[]) => {
    const promises: Promise<any>[] = []
    await questions.forEach(async (question, index) => {
        const newQuestion = {
            number: index + 1,
            body: question[0].content,
        }
        const tempResources = (question[0].hasImage) ? (question[0].imageLinks) : ([])
        const questionResources = await uploadResources(tempResources)
        question.shift()
        const answerChoices: any[] = []
        question.forEach(async (answerChoice, index) => {
            const ac = {
                choiceIndex: index,
                body: answerChoice.content,
                //resources: [] as any
            }
            //resources = (answerChoice.hasImage) ? (answerChoice.imageLinks) : ([]),
            //ac.resources = await uploadResources(resources)
            answerChoices.push(ac)
        });

        promises.push(prisma.question.create({
            data: {
                courseId: courseId,
                examId: examId,
                number: newQuestion.number,
                body: newQuestion.body,
                answerChoices: {
                    createMany: {
                        data: answerChoices
                    }
                },
                resources: {
                    connect: questionResources?.map((id) => ({ id: id }))
                }
            },
            include: {
                submissions: true,
                topics: true,
                answerChoices: {
                    orderBy: {
                        choiceIndex: 'asc'
                    },
                    include: {
                        resources: {
                            include: {
                                image: true,
                                code: true
                            }
                        }
                    }
                },
                resources: {
                    include: {
                        image: true,
                        code: true
                    }
                }
            }
        }))
    });
    return await Promise.all(promises)
}


const uploadResources = (resources) => {
    const resourceIds = new Array()
    resources.forEach(async (resource) => {
        const image = await axios.get(resource, {
            responseType: 'arraybuffer',
        })

        const contentType = image.headers['content-type'];

        const data = await uploadFileToS3(image.data, contentType);

        const resp = await prisma.resource.create({
            data: {
                type: ResourceType.IMAGE,
                image: {
                    create: {
                        key: data.Key,
                        url: data.Location,
                    }
                }
            }
        })
        resourceIds.push(resp.id)
    });
    if (resourceIds.length) {
        return resourceIds
    }
    return undefined
}

export default uploadQuestions