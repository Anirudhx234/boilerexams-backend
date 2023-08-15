declare namespace Express {
    type Session = import('express-session').Session
    type User = import('@prisma/client').User

    interface SessionExtended extends Session {
        _garbage: string;
    }

    export interface Request {
        published: {published: boolean}[];
        user: User;
        session: SessionExtended;
    }
}