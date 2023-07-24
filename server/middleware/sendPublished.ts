import { PrismaClient } from '@prisma/client';
import asyncWrapper from './wrappers/asyncWrapper';
const prisma = new PrismaClient();

const sendPublished = asyncWrapper(async (req, res, next) => {
    req.published = [{ published: true }, { published: false }]
    return next()
})

export default sendPublished