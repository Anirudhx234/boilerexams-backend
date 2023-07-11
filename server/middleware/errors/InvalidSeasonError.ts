export default class InvalidSeasonError extends Error {
    errorCode: number

    constructor(message) {
        super(message)
        this.message = "Invalid season"
        this.errorCode = 400
    }
}