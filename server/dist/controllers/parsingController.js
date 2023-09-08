var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import prisma from "../libs/prisma.js";
import parseQuestions from "../helpers/mathpix/questionParser.js";
import getPDFResult from "../helpers/mathpix/retrievePDF.js";
import FormData from 'form-data';
import axios from 'axios';
import { APIError, NotFoundError } from "../middleware/errors/index.js";
import uploadQuestions from "../helpers/mathpix/uploadQuestions.js";
import savePDFtoExam from '../helpers/mathpix/savePDFtoExam.js';
const checkExistingQuestions = (examId) => __awaiter(void 0, void 0, void 0, function* () {
    const exam = yield prisma.exam.findFirst({
        where: {
            id: examId
        },
        include: {
            course: true,
            questions: true
        }
    });
    if (!exam) {
        throw new NotFoundError("Exam not found");
    }
    if (exam.questions.length > 0) {
        throw new Error("Exam already contains questions. Delete questions before scanning new PDF.");
    }
    else {
        return exam.course.id;
    }
});
const parseFromFile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { examId, choices } = req.body;
    const courseId = yield checkExistingQuestions(examId);
    if (!req.file) {
        throw new Error("No file attached");
    }
    const data = new FormData();
    data.append("file", req.file.buffer, {
        filename: req.file.originalname,
        contentType: req.file.mimetype
    });
    const options_json = {
        math_inline_delimiters: ["\$", "\$"],
        conversion_formats: {
            "tex.zip": true,
        },
        numbers_default_to_math: true,
    };
    data.append('options_json', JSON.stringify(options_json));
    const config = {
        method: "post",
        maxBodyLength: Infinity,
        url: "https://api.mathpix.com/v3/pdf",
        headers: Object.assign({ 'app_key': process.env.MATHPIX_KEY, 'Content-Type': 'multipart/form-data' }, data.getHeaders()),
        data: data
    };
    const pdf = yield axios.request(config);
    const id = pdf.data.pdf_id;
    yield savePDFtoExam(examId, req.file.buffer, req.file.mimetype, id);
    let content;
    try {
        content = yield getPDFResult(id);
    }
    catch (error) {
        return res.status(202).send({ id: id, message: "PDF not processed yet, please try again later using id" });
    }
    const questions = parseQuestions(content, Number(choices));
    const uploadedQuestions = yield uploadQuestions(courseId, examId, questions);
    return res.status(200).send({ id: id, questions: uploadedQuestions });
});
const parseFromLink = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { examId, link, choices } = req.body;
    const courseId = yield checkExistingQuestions(examId);
    if (!link) {
        throw new Error("No link provided");
    }
    const file = yield axios.get(link, {
        responseType: 'arraybuffer',
        maxContentLength: 5 * 1024 * 1024,
    });
    const contentType = file.headers["content-type"];
    if (contentType !== "application/pdf") {
        throw new APIError("Link must be pdf", 415);
    }
    const headers = {
        'app_id': process.env.MATHPIX_ID,
        'app_key': process.env.MATHPIX_KEY,
        'Content-Type': 'application/json'
    };
    const pdf = yield axios.post("https://api.mathpix.com/v3/pdf", {
        url: link,
        conversion_formats: {
            "tex.zip": true,
        },
        enable_spell_check: false,
        enable_tables_fallback: false,
        auto_number_sections: false,
        numbers_default_to_math: true,
        math_inline_delimiters: ["\$", "\$"],
    }, {
        headers: headers
    });
    const id = pdf.data.pdf_id;
    yield savePDFtoExam(examId, file.data, contentType, id);
    let content;
    try {
        content = yield getPDFResult(id);
    }
    catch (error) {
        return res.status(202).send({ id: id, message: "PDF not processed yet, please try again later using id" });
    }
    const questions = parseQuestions(content, choices);
    const uploadedQuestions = yield uploadQuestions(courseId, examId, questions);
    return res.status(200).send({ id: id, questions: uploadedQuestions });
});
// SAMPLE IDS TO USE FOR TESTING (ALREADY PROCESSED)
//2023_06_28_75fdd6edc01be3a36ec9g
//2023_06_28_5d29a85a83a19b1dd0a7g
//2023_06_21_55f826e7aef9550a4dccg
//2023_06_20_6f00c60af0637a2a7afbg
//2023_06_26_c43f04fde2b3f43e8da8g -> this one is weird
//2023_06_20_6f00c60af0637a2a7afbg
//2023_06_25_d25c2986903bb495d7edg
//2023_06_21_55f826e7aef9550a4dccg
//2023_06_25_71ec7181e0d7aba87642g
//2023_06_19_d67ee4497ecd37894300g -> CS
//2023_06_19_d67ee4497ecd37894300g -> CS, the one that worked with pdf
//2023_06_28_75fdd6edc01be3a36ec9g -> CS
//2023_06_25_d25c2986903bb495d7edg
const getIdResults = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { examId, pdfId, choices } = req.body;
    const courseId = yield checkExistingQuestions(examId);
    let content;
    try {
        content = yield getPDFResult(pdfId);
    }
    catch (error) {
        return res.status(202).send({ id: pdfId, message: "PDF not processed yet, please try again later using id" });
    }
    const questions = parseQuestions(content, choices);
    const uploadedQuestions = yield uploadQuestions(courseId, examId, questions);
    res.status(200).send({ id: pdfId, questions: uploadedQuestions });
});
const attachPDFToExam = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { examId } = req.params;
    if (!req.file) {
        throw new Error("No file attached");
    }
    const exam = yield savePDFtoExam(examId, req.file.buffer, req.file.mimetype);
    res.status(200).send(exam);
});
export { parseFromFile, parseFromLink, getIdResults, attachPDFToExam };
//# sourceMappingURL=parsingController.js.map