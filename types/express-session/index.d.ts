import { SessionOptions } from "express-session";

// @ts-ignore
declare module "express-session" {
    export type SessionOptionsExtended = SessionOptions & {
        cookie: {
            sameSite: "strict" | "none";
        };
    };

    export interface Session {
        _garbage: string;
    }
}
