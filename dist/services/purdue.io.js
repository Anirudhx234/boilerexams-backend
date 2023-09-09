var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { InvalidCourseError, NotFoundError } from "../middleware/errors/index.js";
import axios from "axios";
export class PurdueIoAPI {
    static getCourse(subject, number) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = `https://api.purdue.io/odata/Courses?$filter=Subject/Abbreviation eq '${subject.Abbreviation}' and Number eq '${number}'`;
            const request = yield axios.get(query);
            const course = request.data.value[0];
            if (!course)
                throw new InvalidCourseError(`Invalid Course ${subject.Abbreviation} ${number}`);
            return course;
        });
    }
    static getSubject(abbreviation) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = `https://api.purdue.io/odata/Subjects?$filter=Abbreviation eq '${abbreviation}'`;
            const request = yield axios.get(query);
            const subject = request.data.value[0];
            if (!subject)
                throw new InvalidCourseError(`Invalid Subject ${abbreviation}`);
            return subject;
        });
    }
    static getCurrentTerm() {
        return __awaiter(this, void 0, void 0, function* () {
            const query = `https://api.purdue.io/odata/Terms?$orderby=EndDate asc`;
            const request = yield axios.get(query);
            const terms = request.data.value;
            const term = terms.find(element => {
                const now = Date.now();
                const date = Date.parse(element.EndDate);
                return now < date;
            });
            if (!term)
                throw new NotFoundError(`Could Not Find Current Term`);
            return term;
        });
    }
}
//# sourceMappingURL=purdue.io.js.map