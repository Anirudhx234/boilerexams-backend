export default class NotFoundError extends Error {
    constructor(message) {
        super(message);
        this.errorCode = 404;
    }
}
//# sourceMappingURL=NotFoundError.js.map