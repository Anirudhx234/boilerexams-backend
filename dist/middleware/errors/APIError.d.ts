export default class APIError extends Error {
    errorCode: number;
    constructor(message: string, errorCode: number);
}
