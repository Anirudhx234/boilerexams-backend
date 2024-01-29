export default class CourseAlreadyExistsError extends Error {
    errorCode: number;

    constructor(message) {
        super(message);
        this.errorCode = 400;
    }
}
