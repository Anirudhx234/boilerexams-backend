var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import axios from 'axios';
import { NotFoundError } from '../../middleware/errors/index.js';
const getPDFResult = (pdf_id) => __awaiter(void 0, void 0, void 0, function* () {
    const headers = {
        'app_id': process.env.MATHPIX_ID,
        'app_key': process.env.MATHPIX_KEY
    };
    const url = "https://api.mathpix.com/v3/pdf/".concat(pdf_id);
    const response = yield axios.get(url, {
        headers: headers
    });
    if (response.data.error) {
        throw new NotFoundError("Requested PDF not found");
    }
    if (response.data.status != "completed") {
        yield new Promise(f => setTimeout(f, 15000));
    }
    const content = yield axios.get(url.concat(".tex"), {
        headers: headers
    });
    return content.data;
});
export default getPDFResult;
//# sourceMappingURL=retrievePDF.js.map