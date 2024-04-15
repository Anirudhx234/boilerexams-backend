import express from "express";
import type { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";
import passport from "passport";
import corsOptions from "./utils/corsOptions.js";
import sessionOptions from "./utils/sessionOptions.js";
import initializePassport from "./middleware/auth/passport/index.js";
import routes from "./routes/index.js";
import errorHandler from "./middleware/errors/errorHandler.js";
import { scheduleUpdateStats } from "./helpers/stats/updateStats.js";
import prisma from "./prisma/prisma.js";

(BigInt.prototype as any).toJSON = function () {
    return this.toString();
};

const app = express();

app.use(cors(corsOptions));

initializePassport(passport);

app.use("/favicon.ico", express.static("images/favicon.ico"));

app.use(cookieParser());
app.use(express.json());

if (process.env["REMOTE"] === "enabled") {
    app.set("trust proxy", 1);
}

app.use(session(sessionOptions));
app.use(passport.initialize());
app.use(passport.session());

app.get("/", (req: Request, res: Response) => {
    res.send("Working");
});

app.get("/docs", (req: Request, res: Response) => {
    res.redirect(process.env["DOCS_URL"] ?? "/")
});

app.use(routes);
app.use(errorHandler);

const PORT = process.env["PORT"];

scheduleUpdateStats();

app.listen(PORT, async () => {
    console.log(`Server is running at port ${PORT}`);

    const allFeedback = await prisma.feedback.findMany({
        include: {
            question: {
                select: {
                    courseId: true,
                    examId: true
                }
            }
        }
    });

    console.log("Migrating Feedback Relations");
    let updates = 0;

    for (const feedback of allFeedback) {
        const question = feedback.question;

        if (!question) continue;

        await prisma.feedback.update({
            where: {
                id: feedback.id
            },
            data: {
                courseId: question.courseId,
                examId: question.examId
            }
        });
        updates += 1;
    }

    console.log(`Created ${updates} Feedback Relations`);
});
