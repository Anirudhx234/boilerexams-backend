var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import prisma from "../../libs/prisma.js";
import uploadFileToS3 from '../../utils/uploadFileToS3.js';
const savePDFtoExam = (examId, buffer, contentType, id) => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield uploadFileToS3(buffer, contentType);
    return yield prisma.exam.update({
        where: {
            id: examId
        },
        data: {
            pdfId: id,
            pdfKey: data.Key,
            pdfLink: data.Location
        }
    });
});
export default savePDFtoExam;
//# sourceMappingURL=savePDFtoExam.js.map