export default class InvalidCourseError extends Error {
    errorCode: number;

    constructor(message) {
        super(message);
        this.errorCode = 406;
    }
}