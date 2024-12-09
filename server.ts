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
import { DiscordAPI } from "./services/discord.api.js";

(BigInt.prototype as any).toJSON = function () {
    return this.toString();
};

const app = express();

app.use(cors(corsOptions));

initializePassport(passport);

app.use("/favicon.ico", express.static("images/favicon.ico"));

app.use(cookieParser());
app.use(express.json({ limit: '250kb' }));

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

const server = app.listen(PORT, async () => {
    console.log(`Server is running at port ${PORT}`);
    await DiscordAPI.start();
});


async function shutdown(message: string, err?: Error) {
    console.log(`Shutting down server... ${message}`);
    await DiscordAPI.stop(message, err).then(() => {
        server.close(() => {
            process.exit(0);
        });
    });
}

// Listen for termination signals
process.on('SIGINT', async () => {
    await shutdown('Received SIGINT (Ctrl+C).');
});

process.on('SIGTERM', async () => {
    await shutdown('Received SIGTERM.').then();
});

// Handle uncaught exceptions to log errors and exit gracefully
process.on('uncaughtException', async (err) => {
    await shutdown('Uncaught Exception:', err);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', async (reason, promise) => {
    const message = `
    [Unhandled Rejection]
    Promise: ${JSON.stringify(promise, null, 2)}
    Reason: ${reason instanceof Error ? reason.stack : reason}
    `;
    await shutdown(message);
});