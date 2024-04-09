import express from "express";
import type { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";
import passport from "passport";
import corsOptions from "./utils/corsOptions.js";
import sessionOptions from "./utils/sessionOptions.js";
import initializePassport from "./middleware/auth/passport/index.js";
import swaggerUi from 'swagger-ui-express';
import docs from "./docs/index.js";
import routes from "./routes/index.js";
import errorHandler from "./middleware/errorHandler.js";
import { scheduleUpdateStats } from "./helpers/stats/updateStats.js";


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

app.use("/docs", swaggerUi.serve, swaggerUi.setup(docs));

app.use(routes);

app.use(errorHandler);

const PORT = process.env["PORT"];

scheduleUpdateStats();

app.listen(PORT, () => {
    console.log(`Server is running at port ${PORT}`);
});



export default app;

