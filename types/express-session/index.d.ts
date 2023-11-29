type SessionOptions = import('express-session').SessionOptions

type SessionOptionsExtended = SessionOptions & {
    cookie: {
        sameSite: "strict" | "none"
    };
}