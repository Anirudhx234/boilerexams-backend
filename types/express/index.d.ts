declare namespace Express {
    // @ts-ignore
    type User = import("@prisma/client").User;
    export interface Request {
        clientId: string;
        anonymous: boolean;
        sendUnpublished: boolean;
        submissionLimited: boolean;
        // @ts-ignore
        user: User;
        // @ts-ignore
        logOut: any;
    }
}
