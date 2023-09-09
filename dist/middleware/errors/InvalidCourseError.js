export default class InvalidCourseError extends Error {
    constructor(message) {
        super(message);
        this.errorCode = 406;
    }
}
//# sourceMappingURL=InvalidCourseError.js.map