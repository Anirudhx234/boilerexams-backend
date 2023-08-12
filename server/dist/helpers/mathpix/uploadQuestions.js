var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { PrismaClient, ResourceType } from '@prisma/client';
import axios from "axios";
import uploadFileToS3 from '../../utils/uploadFileToS3.js';
const prisma = new PrismaClient();
const uploadQuestions = (courseId, examId, questions) => __awaiter(void 0, void 0, void 0, function* () {
    const promises = [];
    yield questions.forEach((question, index) => __awaiter(void 0, void 0, void 0, function* () {
        const newQuestion = {
            number: index + 1,
            body: question[0].content,
        };
        const tempResources = (question[0].hasImage) ? (question[0].imageLinks) : ([]);
        const questionResources = yield uploadResources(tempResources);
        question.shift();
        const answerChoices = [];
        question.forEach((answerChoice, index) => __awaiter(void 0, void 0, void 0, function* () {
            const ac = {
                choiceIndex: index,
                body: answerChoice.content,
                //resources: [] as any
            };
            //resources = (answerChoice.hasImage) ? (answerChoice.imageLinks) : ([]),
            //ac.resources = await uploadResources(resources)
            answerChoices.push(ac);
        }));
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
                    connect: questionResources === null || questionResources === void 0 ? void 0 : questionResources.map((id) => ({ id: id }))
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
        }));
    }));
    return yield Promise.all(promises);
});
const uploadResources = (resources) => {
    const resourceIds = new Array();
    resources.forEach((resource) => __awaiter(void 0, void 0, void 0, function* () {
        const image = yield axios.get(resource, {
            responseType: 'arraybuffer',
        });
        const contentType = image.headers['content-type'];
        const data = yield uploadFileToS3(image.data, contentType);
        const resp = yield prisma.resource.create({
            data: {
                type: ResourceType.IMAGE,
                image: {
                    create: {
                        key: data.Key,
                        url: data.Location,
                    }
                }
            }
        });
        resourceIds.push(resp.id);
    }));
    if (resourceIds.length) {
        return resourceIds;
    }
    return undefined;
};
export default uploadQuestions;
//# sourceMappingURL=uploadQuestions.js.map