import APIError from "./APIError.js";

export default class CourseAlreadyExistsError extends APIError {

    constructor(message: string) {
        super(message, 400);
    }
}
