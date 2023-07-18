export default class APIError extends Error {
    errorCode: number

    constructor(message: string, errorCode: number) {
        super(message)
        this.errorCode = errorCode
    }
}