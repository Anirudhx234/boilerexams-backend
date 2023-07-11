export default class InvalidSeasonError extends Error {
    errorCode: number

    constructor(message) {
        super(message)
        this.errorCode = 400
    }
}