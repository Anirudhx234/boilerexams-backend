import { PrismaClient } from '@prisma/client';
import asyncWrapper from './wrappers/asyncWrapper';
const prisma = new PrismaClient();

const sendPublished = asyncWrapper(async (req, res, next) => {
    console.log(req.cookies)
    if (req.cookies && req.cookies.sessionId) {
        const session = await prisma.session.findUnique({
            where: {
                id: req.cookies.sessionId
            },
            include: {
                user: true
            }
        })

        if (!session) {
            throw new Error("Invalid session id")
        }

        if (["ADMIN", "CONTENT"].includes(session.user.role)) {
            req.published = [{published: true}, {published: false}]
            return next()
        }
    }
    req.published = [{published: true}]
    return next()
})

export default sendPublished