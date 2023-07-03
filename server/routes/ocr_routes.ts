const express = require('express');
const app = express();

const multer = require('multer');
const axios = require('axios');

const dotenv = require("dotenv");
dotenv.config();

const storage = multer.memoryStorage({
    destination: function (req, file, cb) {
        cb(null, true)
    }
})

const upload = multer({ storage: storage });
const FormData = require('form-data');

interface QuestionPart {
    content: string,
    hasImage: boolean,
    imageLinks?: string[]
}

const parseQuestions = (content, choices) => {
    const regex1 = /\\[a-z]+\{enumerate\}/g
    const regex2 = /\\setcounter\{enumi\}\{[0-9]*\}/g
    const questions = content.data.substring(content.data.search('begin\{document\}') + 15, content.data.search('\\end\{document\}')).replaceAll(regex1, '').replaceAll(regex2, '').split(/\\item|\\section/)
    const images = content.data.substring(content.data.search('\\end\{document\}')).match(/(.+)(https:\/\/cdn.mathpix.com\/.+)PK/g)

    let modifiedQuestion = new Array<QuestionPart[]>()
    let qs = 0


    questions.forEach(question => {
        let multiQ
        let singleQ
        let q = question


        let mQR, sQR


        switch (choices) {
            case "4":
                mQR = /(.+)\(*[Aa][\.\)](.+)\(*[Bb][\.\)](.+)\(*[Cc][\.\)](.+)\(*[Dd][\.\)](.+)[0-9]+[\.\)]/s
                sQR = /(.+)\(*[Aa][\.\)](.+)\(*[Bb][\.\)](.+)\(*[Cc][\.\)](.+)\(*[Dd][\.\)](.+)/s
                break;
            case "5":
                mQR = /(.+)\(*[Aa][\.\)](.+)\(*[Bb][\.\)](.+)\(*[Cc][\.\)](.+)\(*[Dd][\.\)](.+)\(*[Ee][\.\)](.+)[0-9]+[\.\)]/s
                sQR = /(.+)\(*[Aa][\.\)](.+)\(*[Bb][\.\)](.+)\(*[Cc][\.\)](.+)\(*[Dd][\.\)](.+)\(*[Ee][\.\)](.+)/s
                break;
            case "6":
                mQR = /(.+)\(*[Aa][\.\)](.+)\(*[Bb][\.\)](.+)\(*[Cc][\.\)](.+)\(*[Dd][\.\)](.+)\(*[Ee][\.\)](.+)\(*[Ff][\.\)](.+)[0-9]+[\.\)]/s
                sQR = /(.+)\(*[Aa][\.\)](.+)\(*[Bb][\.\)](.+)\(*[Cc][\.\)](.+)\(*[Dd][\.\)](.+)\(*[Ee][\.\)](.+)\(*[Ff][\.\)](.+)/s
                break;
        }

        const section = new Array<QuestionPart[]>()
        while (multiQ = q.match(mQR)) {
            if (singleQ = q.substring(multiQ[0].length).match(sQR)) {
                section.push(checkImage(singleQ, images))
                qs += 1
            }
            q = q.substring(0, multiQ[0].length - 2)
        }
        if (singleQ = q.match(sQR)) {
            section.push(checkImage(singleQ, images))
            qs += 1
        }
        modifiedQuestion = modifiedQuestion.concat(section.reverse())
    });
    return modifiedQuestion
}

const checkImage = (arr, images) => {
    let question = new Array<QuestionPart>()
    arr.shift()
    arr.forEach(element => {
        let part: QuestionPart = {
            content: element.trim(),
            hasImage: false,
        }
        const imageReg = /includegraphics.+\{([^\{\}]+)\}/g
        let image
        let imagelinks = new Array<string>()
        while (image = imageReg.exec(element)) {
            console.log(`image=${image}`)
            const imageid = image[1].substring(0, image[1].length).replaceAll(/\(/g, '\\\(').replaceAll(/\)/g, '\\\)')
            console.log(`imageid=${imageid}`)
            const i = images.find(i => i.replaceAll(/\(/g, '\\\(').replaceAll(/\)/g, '\\\)').includes(imageid))
            if (i) {
                const imageURL = i.substring(i.search("https\:"), i.length - 2)
                imagelinks.push(imageURL)
            }
        }
        if (imagelinks.length != 0) {
            part.hasImage = true
            part.imageLinks = imagelinks
        }
        question.push(part)
    });
    return question
}


const getPDFResult = async (pdf_id) => {
    const headers = {
        'app_id': process.env.MATHPIX_ID,
        'app_key': process.env.MATHPIX_KEY,
        'Content-Type': 'application/json'
    }
    const url = "https://api.mathpix.com/v3/pdf/".concat(pdf_id)
    const response = await axios.get(url, {
        headers: headers
    })
    if (response.data.error) {
        throw new Error("Invalid pdf id")
    }
    if (response.data.status != "completed") {
        await new Promise(f => setTimeout(f, 15000));
    }

    return axios.get(url.concat(".tex"), {
        headers: headers
    })
}

app.post("/convert-link", async (req, res) => {
    try {
        if (!req.body.link) {
            throw new Error("No link provided");
        }
        const headers = {
            'app_id': process.env.MATHPIX_ID,
            'app_key': process.env.MATHPIX_KEY,
            'Content-Type': 'application/json'
        }
        const id = await axios.post("https://api.mathpix.com/v3/pdf", {
            url: req.body.link,
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

        try {
            const content = await getPDFResult(id.data.pdf_id)
            const questions = parseQuestions(content, req.body.choices);
            return res.status(200).send({ id: id.data.pdf_id, questions: questions })
        } catch (err) {
            res.status(503).send("PDF not processed yet, please try again later using id")
        }
    } catch (err) {
        res.status(400).send(err);
    }
})

app.post("/convert-file", upload.single("file"), async (req, res) => {
    try {
        console.log(req.file)
        console.log(req.body.choices)
        if (!req.file) {
            throw new Error("No file uploaded")
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
        const id = await axios.request(config)

        try {
            const content = await getPDFResult(id.data.pdf_id)
            const questions = parseQuestions(content, req.body.choices);
            return res.status(200).send({ id: id.data.pdf_id, questions: questions })
        } catch (err) {
            res.status(503).send("PDF not processed yet, please try again later using id")
        }
    } catch (err) {
        res.status(400).send(err);
    }
})

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
app.post("/convert-id", async (req, res) => {
    try {
        const content = await getPDFResult(req.body.pdf_id)
        const questions = parseQuestions(content, req.body.choices);
        res.status(200).send(questions)
    } catch (err) {
        res.status(400).send(err);
    }
})


/* Image convert route, might use later
app.post("/convert", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            throw Error
        }
        const fileData = req.file.buffer.toString('base64');
        const response = await axios.post('https://api.mathpix.com/v3/text', {
            src: `data:${req.file.mimetype};base64,${fileData}`,
            formats: [
                "text",
                "data",
                "latex_simplified",
                "latex_styled",
                "mathml",
                "asciimath",
                "latex_list"],
            //math_inline_delimiters: ["$", "$"],
            //math_display_delimiters: ["$", "$"],
            data_options: {
                include_asciimath: true,
                include_latex: true
            }
        }, {
            headers: {
                'app_id': process.env.MATHPIX_ID,
                'app_key': process.env.MATHPIX_KEY,
                'Content-Type': 'application/json'
            }
        });
        console.log(response.data)
        res.status(200).send(response.data)
    } catch (err) {
        res.status(400).send(err);
    }
}) */

module.exports = app;
export { }
