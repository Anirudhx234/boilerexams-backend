import { PrismaClient } from '@prisma/client';
import asyncWrapper from './wrappers/asyncWrapper';
const prisma = new PrismaClient();

const sendPublished = asyncWrapper(async (req, res, next) => {
    if (req.cookies && req.cookies.accessToken) {
        const account = await prisma.account.findFirst({
            where: {
                access_token: req.cookies.accessToken
            },
            include: {
                user: true
            }
        })

        if (!account) {
            req.published = [{ published: true }]
            return next()
        }

        if (["ADMIN", "CONTENT"].includes(account.user.role)) {
            req.published = [{ published: true }, { published: false }]
            return next()
        }
    }
    req.published = [{ published: true }]
    return next()
})

export default sendPublished