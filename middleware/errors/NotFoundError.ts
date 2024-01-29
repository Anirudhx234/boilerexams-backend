export default class NotFoundError extends Error {
    errorCode: number;

    constructor(message: string) {
        super(message);
        this.errorCode = 404;
    }
}
