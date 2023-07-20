import { PrismaClient } from '@prisma/client';
import parseQuestions from "../helpers/mathpix/questionParser";
import getPDFResult from "../helpers/mathpix/retrievePDF";
import dotenv from 'dotenv'
import FormData from 'form-data';
import axios from 'axios';
import { APIError, NotFoundError } from "../middleware/errors/index";
import uploadQuestions from "../helpers/mathpix/uploadQuestions";
import savePDFtoExam from '../helpers/mathpix/savePDFtoExam';

const prisma = new PrismaClient
dotenv.config()

const checkExistingQuestions = async (courseId: string, examId: string) => {
    const exam = await prisma.exam.findFirst({
        where: {
            id: examId,
            courseId: courseId
        },
        include: {
            questions: true
        }
    })
    
    if (!exam) {
        throw new NotFoundError("Course and/or exam not found")
    }
    if (exam.questions.length > 0) {
        throw new Error("Exam already contains questions. Delete questions before scanning new PDF.")
    }
    else {
        return
    }
}


const parseFromFile = async (req, res) => {
    const { courseId, examId, choices } = req.body

    await checkExistingQuestions(courseId, examId)
    if (!req.file) {
        throw new Error("No file attached")
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
    data.append('options_json', JSON.stringify(options_json))

    let config = {
        method: "post",
        maxBodyLength: Infinity,
        url: "https://api.mathpix.com/v3/pdf",
        headers: {
            'app_key': process.env.MATHPIX_KEY,
            'Content-Type': 'multipart/form-data',
            ...data.getHeaders()
        },
        data: data
    }
    const pdf = await axios.request(config)
    const id = pdf.data.pdf_id

    await savePDFtoExam(examId, id, req.file.buffer)

    let content;
    try {
        content = await getPDFResult(id);
    } catch (error) {
        return res.status(202).send({ id: id, message: "PDF not processed yet, please try again later using id" })
    }
    const questions = parseQuestions(content, Number(choices));
    const uploadedQuestions = await uploadQuestions(courseId, examId, questions)
    return res.status(200).send({ id: id, questions: uploadedQuestions })
}

const parseFromLink = async (req, res) => {
    const { courseId, examId, link, choices } = req.body

    await checkExistingQuestions(courseId, examId)
    if (!link) {
        throw new Error("No link provided");
    }

    const file = await axios.get(link, {
        responseType: 'arraybuffer',
        maxContentLength: 5 * 1024 * 1024,
    })

    if (file.headers["content-type"] !== "application/pdf") {
        throw new APIError("Link must be pdf", 415)
    }

    const headers = {
        'app_id': process.env.MATHPIX_ID,
        'app_key': process.env.MATHPIX_KEY,
        'Content-Type': 'application/json'
    }
    const pdf = await axios.post("https://api.mathpix.com/v3/pdf", {
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
    })
    const id = pdf.data.pdf_id

    await savePDFtoExam(examId, id, file.data)

    let content;
    try {
        content = await getPDFResult(id);
    } catch (error) {
        return res.status(202).send({ id: id, message: "PDF not processed yet, please try again later using id" })
    }
    const questions = parseQuestions(content, choices);
    const uploadedQuestions = await uploadQuestions(courseId, examId, questions)
    return res.status(200).send({ id: id, questions: uploadedQuestions })
}

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

const getIdResults = async (req, res) => {
    const { courseId, examId, pdf_id, choices } = req.body

    await checkExistingQuestions(courseId, examId)
    let content;
    try {
        content = await getPDFResult(pdf_id);
    } catch (error) {
        return res.status(202).send({ id: pdf_id, message: "PDF not processed yet, please try again later using id" })
    }
    const questions = parseQuestions(content, choices);
    const uploadedQuestions = await uploadQuestions(courseId, examId, questions)
    res.status(200).send({ id: pdf_id, questions: uploadedQuestions })
}

export {
    parseFromFile,
    parseFromLink,
    getIdResults
}