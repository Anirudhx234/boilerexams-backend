import { SessionOptions } from "express-session";

declare module 'express-session' {
    export type SessionOptionsExtended = SessionOptions & {
        cookie: {
            sameSite: "strict" | "none"
        }
    }

   export interface Session {
    _garbage: string;
  }
}