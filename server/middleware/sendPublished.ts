import { PrismaClient } from '@prisma/client';
import asyncWrapper from './wrappers/asyncWrapper';
const prisma = new PrismaClient();

const sendPublished = asyncWrapper(async (req, res, next) => {
    if (req.cookies && (req.cookies["next-auth.session-token"] || req.cookies["__Secure-next-auth.session-token"])) {
        const sessionToken = req.cookies["next-auth.session-token"] || req.cookies["__Secure-next-auth.session-token"]
        const session = await prisma.session.findFirst({
            where: {
                sessionToken
            },
            include: {
                user: true
            }
        })

        if (!session) {
            req.published = [{ published: true }]
            return next()
        }

        if (["ADMIN", "CONTENT"].includes(session.user.role)) {
            req.published = [{ published: true }, { published: false }]
            return next()
        }
    }
    req.published = [{ published: true }, {published:false}]
    return next()
})

export default sendPublished