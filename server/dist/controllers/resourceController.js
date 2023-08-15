var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { PrismaClient, ResourceType, Language } from '@prisma/client';
import axios from 'axios';
import { APIError } from '../middleware/errors/index.js';
import uploadFileToS3 from '../utils/uploadFileToS3.js';
const prisma = new PrismaClient();
const getResource = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { resourceId } = req.params;
    const resource = yield prisma.resource.findUnique({
        where: {
            id: resourceId
        },
        include: {
            image: true,
            code: true
        }
    });
    res.status(200).send(resource);
});
const createImageResource = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { altText } = req.body;
    if (!req.file) {
        throw new APIError("No file attached", 400);
    }
    const data = yield uploadFileToS3(req.file.buffer, req.file.mimetype);
    const resource = yield prisma.resource.create({
        data: {
            type: ResourceType.IMAGE,
            image: {
                create: {
                    key: data.Key,
                    url: data.Location,
                    altText: altText
                }
            }
        },
        include: {
            image: true
        }
    });
    res.status(200).send(resource);
});
const createImageResourceFromLink = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { link, altText } = req.body;
    const image = yield axios.get(link, {
        responseType: 'arraybuffer',
        maxContentLength: 1000 * 1024
    });
    const contentType = image.headers['content-type'];
    if (contentType !== "image/png" && contentType !== "image/jpeg") {
        throw new APIError("Image upload failed, link must be JPEG or PNG", 415);
    }
    const data = yield uploadFileToS3(image.data, contentType);
    const resource = yield prisma.resource.create({
        data: {
            type: ResourceType.IMAGE,
            image: {
                create: {
                    key: data.Key,
                    url: data.Location,
                    altText: altText
                }
            }
        },
        include: {
            image: true
        }
    });
    res.status(200).send(resource);
});
const createCodeResource = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { language, code } = req.body;
    const resource = yield prisma.resource.create({
        data: {
            type: ResourceType.CODE,
            code: {
                create: {
                    language: Language[language.toUpperCase()],
                    code: code
                }
            }
        },
        include: {
            code: true
        }
    });
    res.status(200).send(resource);
});
const updateCodeResource = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { resourceId } = req.params;
    const { language, code } = req.body;
    const resource = yield prisma.resource.update({
        where: {
            id: resourceId
        },
        data: {
            code: {
                update: {
                    language: Language[language.toUpperCase()],
                    code: code
                }
            }
        },
        include: {
            code: true
        }
    });
    res.status(200).send(resource);
});
const deleteResource = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { resourceId } = req.params;
    const resource = yield prisma.resource.delete({
        where: {
            id: resourceId
        }
    });
    res.status(200).send(resource);
});
export { getResource, createImageResource, createImageResourceFromLink, createCodeResource, updateCodeResource, deleteResource };
//# sourceMappingURL=resourceController.js.map