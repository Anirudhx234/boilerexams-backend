import APIError from "./APIError.js";

export default class NotFoundError extends APIError {

    constructor(message: string) {
        super(message, 404);
    }
}
