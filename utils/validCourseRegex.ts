import { InvalidCourseError } from "../middleware/errors/index.js";

// ToDo Deprecated

const validCourseRegex = (courseAbbrev: string) => {
    const regex = /([a-zA-Z]+)(\d+)/;
    const matches = courseAbbrev.match(regex);
    if (matches) {
        return { abbreviation: matches[1], number: matches[2] };
    }
    throw new InvalidCourseError("Invalid parameters");
};

export default validCourseRegex;
