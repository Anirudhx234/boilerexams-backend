import { PrismaClient, ResourceType } from '@prisma/client'
import axios from "axios";
import { nanoid } from 'nanoid';

const prisma = new PrismaClient()
var Aws = require('aws-sdk');

const s3 = new Aws.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
})

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
        const answerChoices : any[] = []
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
                    connect: questionResources?.map((id) => ({id: id}))
                }
            },
            include: {
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
        const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: nanoid(),
            Body: image.data,
            ACL: "public-read-write",
        };

        const promise = s3.upload(params, (error) => {
            if (error) {
                throw new Error(error);
            }
        }).promise()

        const data = await Promise.resolve(promise)
        if (!data) {
            throw new Error("Image upload failed")
        }

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