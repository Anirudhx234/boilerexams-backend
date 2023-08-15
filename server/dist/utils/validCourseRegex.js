import { InvalidCourseError } from "../middleware/errors/index.js";
const validCourseRegex = (courseAbbrev) => {
    const regex = /([a-zA-Z]+)(\d+)/;
    const matches = courseAbbrev.match(regex);
    if (matches) {
        return { abbreviation: matches[1], number: matches[2] };
    }
    throw new InvalidCourseError("Invalid parameters");
};
export default validCourseRegex;
//# sourceMappingURL=validCourseRegex.js.map