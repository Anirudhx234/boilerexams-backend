import session, { type SessionOptionsExtended } from "express-session";
import connect from "connect-pg-simple";

const sessionOptions: SessionOptionsExtended = {
    store: new (connect(session))({
        conString: process.env["DATABASE_URL"],
        tableName: "Session",
        createTableIfMissing: true,
    }),
    secret: process.env["SESSION_SECRET"] || "",
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: "strict",
        secure: false,
        maxAge: 7 * 24 * 60 * 60 * 1000,
    },
    name: "sessionId",
};

if (process.env["REMOTE"] === "enabled") {
    sessionOptions.cookie.secure = true;
    if (process.env["NODE_ENV"] === "development" || process.env["NODE_ENV"] === "canary") {
        sessionOptions.cookie.sameSite = "none";
    }
}

if (process.env["NODE_ENV"] === "development") {
    sessionOptions.name = "sessionIdDev";
}

if (process.env["NODE_ENV"] === "canary") {
    sessionOptions.name = "sessionIdCanary";
}

export default sessionOptions;
