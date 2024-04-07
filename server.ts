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
import errorHandler2 from "./middleware/errorHandler.js";
import prisma from "./prisma/prisma.js";

(BigInt.prototype as any).toJSON = function () {
    return this.toString();
};

// eslint-disable-next-line @typescript-eslint/no-namespace
namespace Boilerexams {
    export const Epoch = new Date(2019, 10);
    export const app = express();
}

console.log("Hello, world!");



async function main() {
    Boilerexams.app.use(cors(corsOptions));

    initializePassport(passport);

    Boilerexams.app.use("/favicon.ico", express.static("images/favicon.ico"));

    Boilerexams.app.use(cookieParser());
    Boilerexams.app.use(express.json());

    if (process.env["REMOTE"] === "enabled") {
        Boilerexams.app.set("trust proxy", 1);
    }

    Boilerexams.app.use(session(sessionOptions));
    Boilerexams.app.use(passport.initialize());
    Boilerexams.app.use(passport.session());

    Boilerexams.app.get("/", (req: Request, res: Response) => {
        res.send("Working");
    });

    Boilerexams.app.use(routes);

    Boilerexams.app.use(errorHandler2);


    const PORT = process.env["PORT"]

    Boilerexams.app.listen(PORT, () => {
        console.log(`Server is running at port ${PORT}`);
    });
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.log(e);
        await prisma.$disconnect();
    });

export default Boilerexams;