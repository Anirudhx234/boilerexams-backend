declare namespace Express {
    type User = import('@prisma/client').User

    export interface Request {
        published: { published: boolean }[];
        user: User;
        logOut: any;
    }
}