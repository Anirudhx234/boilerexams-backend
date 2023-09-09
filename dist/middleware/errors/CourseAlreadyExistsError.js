export default class CourseAlreadyExistsError extends Error {
    constructor(message) {
        super(message);
        this.errorCode = 400;
    }
}
//# sourceMappingURL=CourseAlreadyExistsError.js.map