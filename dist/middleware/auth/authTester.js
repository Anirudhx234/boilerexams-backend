var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import asyncWrapper from '../wrappers/asyncWrapper.js';
import { APIError } from '../errors/index.js';
const authTester = asyncWrapper((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.user) {
        req.session._garbage = Date();
        req.session.touch();
        return next();
    }
    throw new APIError("Unauthenticated", 401);
}));
export default authTester;
//# sourceMappingURL=authTester.js.map