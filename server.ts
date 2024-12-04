import express from "express";
import { Request, Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import { scheduleUpdateStats } from "./helpers/stats/updateStats.js";
import initializePassport from "./middleware/auth/passport/index.js";
import errorHandler from "./middleware/errors/errorHandler.js";
import routes from "./routes/index.js";
import corsOptions from "./utils/corsOptions.js";
import sessionOptions from "./utils/sessionOptions.js";

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
    app.set("trust proxy", 2);
}

app.use(session(sessionOptions));
app.use(passport.initialize());
app.use(passport.session());

app.get("/", (req: Request, res: Response) => {
    res.send("Working");
});

app.get("/docs", (req: Request, res: Response) => {
    res.redirect(process.env["DOCS_URL"] ?? "/");
});

app.use(routes);
app.use(errorHandler);

const PORT = process.env["PORT"];

scheduleUpdateStats();

app.listen(PORT, async () => {
    console.log(`Server is running at port ${PORT}`);
});
