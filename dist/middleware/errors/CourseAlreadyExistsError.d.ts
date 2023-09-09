export default class CourseAlreadyExistsError extends Error {
    errorCode: number;
    constructor(message: any);
}
