import InvalidCourseError from "./errors/InvalidCourseError";
import {InvalidSeasonError, NotFoundError} from "./errors/index";

const errorHandler = (error, req, res, next) => {
    if (error instanceof NotFoundError) {
        return res.status(error.errorCode).send(error.message)
    }

    if (error instanceof InvalidSeasonError) {
        return res.status(error.errorCode).send(error.message)
    }

    if (error instanceof InvalidCourseError) {
        return res.status(error.errorCode).send(error.message)
    }
    return res.status(400).send(error)
}

module.exports = errorHandler