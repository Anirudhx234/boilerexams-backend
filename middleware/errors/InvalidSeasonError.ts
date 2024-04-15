import APIError from "./APIError.js";

export default class InvalidSeasonError extends APIError {

    constructor(message: string) {
        super(message, 400);
    }
}
