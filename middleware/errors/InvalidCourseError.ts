import APIError from "./APIError.js";

export default class InvalidCourseError extends APIError {

    constructor(message: string) {
        super(message, 406);
    }
}
