export default class APIError extends Error {
    constructor(message, errorCode) {
        super(message);
        this.errorCode = errorCode;
    }
}
//# sourceMappingURL=APIError.js.map