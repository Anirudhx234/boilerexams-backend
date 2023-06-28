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
const FormData = require('form-data')

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
                'app_id': "boilerexams_gmail_com_a7d9fe_0dc934",
                'app_key': "9d23dece308b5305a40efa607a7869ad46c10cf18730632581905b537026a8d4",
                'Content-Type': 'application/json'
            }
        });
        console.log(response.data)
        res.status(200).send(response.data)
    } catch (err) {
        res.status(400).send(err);
    }
})


interface QuestionPart {
    content: string,
    hasImage: boolean,
    imageLink?: string
}
    
    
    
    
app.post("/convert-link", async (req, res) => {
    try {
        const headers = {
            'app_id': "boilerexams_gmail_com_a7d9fe_0dc934",
            'app_key': "9d23dece308b5305a40efa607a7869ad46c10cf18730632581905b537026a8d4",
            'Content-Type': 'application/json'
        }
        const id = await axios.post("https://api.mathpix.com/v3/pdf", {
            url: req.body.pdf,
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
        const pdf_id = id.data.pdf_id
        const url = "https://api.mathpix.com/v3/pdf/".concat(pdf_id)
        console.log(url)
        let respond = await axios.get(url, {
            headers: headers
        })
        while (respond.data.status != "completed") {
            await new Promise(f => setTimeout(f, 10000));
            respond = await axios.get(url, {
                headers: headers
            })
        }
        axios.get(url.concat(".tex"), {
        headers: headers
        }).then(async (content) => {
            const questions = await parseQuestions(content, pdf_id, req.body.choices)
            res.status(200).send(questions)
        })
    } catch (err) {
        console.log(err)
        res.status(400).send(err);
    }
})
        
        
    
    
const parseQuestions = async (content, pdf_id, choices) => {
    console.log(content)
    const regex1 = /\\[a-z]+\{enumerate\}/g
    const regex2 = /\\setcounter\{enumi\}\{[0-9]*\}/g
    const questions = content.data.substring(content.data.search('\\item') + 4, content.data.search('\\end\{document\}')).replaceAll(regex1, '').replaceAll(regex2, '').split('\\item')
    //const images = content.data.substring(content.data.search('\\end\{document\}')).match(/https:\/\/cdn.mathpix.com\/.+PK/g)
    const images = content.data.substring(content.data.search('\\end\{document\}')).match(/(.+)(https:\/\/cdn.mathpix.com\/.+)PK/g)

    let arr
    let count = 0
    let modifiedQuestion = new Array()


    questions.forEach(question => {
        //switch statement for choices here
        let multiQReg;
        let singleQReg;
        
        switch(choices) {
            case "4":
                multiQReg = /(.+)\n(\(*[Aa][\.\)].+)\n(\(*[Bb][\.\)].+)\n(\(*[Cc][\.\)].+)\n(\(*[Dd][\.\)].+)[0-9]+\./gs
                singleQReg = /(.+)\n(\(*[Aa][\.\)].+)\n(\(*[Bb][\.\)].+)\n(\(*[Cc][\.\)].+)\n(\(*[Dd][\.\)].+)/gs
                break;
            case "5":
                multiQReg = /(.+)\n(\(*[Aa][\.\)].+)\n(\(*[Bb][\.\)].+)\n(\(*[Cc][\.\)].+)\n(\(*[Dd][\.\)].+)\n(\(*[Ee][\.\)].+)[0-9]+\./gs
                singleQReg = /(.+)\n(\(*[Aa][\.\)].+)\n(\(*[Bb][\.\)].+)\n(\(*[Cc][\.\)].+)\n(\(*[Dd][\.\)].+)\n(\(*[Ee][\.\)].+)/gs
                break;
            case "6":
                multiQReg = /(.+)\n(\(*[Aa][\.\)].+)\n(\(*[Bb][\.\)].+)\n(\(*[Cc][\.\)].+)\n(\(*[Dd][\.\)].+)\n(\(*[Ee][\.\)].+)\n(\(*[Ff][\.\)].+)[0-9]+\./gs
                singleQReg = /(.+)\n(\(*[Aa][\.\)].+)\n(\(*[Bb][\.\)].+)\n(\(*[Cc][\.\)].+)\n(\(*[Dd][\.\)].+)\n(\(*[Ee][\.\)].+)\n(\(*[Ff][\.\)].+)/gs
                break;
        }
        while ((arr = multiQReg.exec(question)) !== null) {
            count += arr[0].length
            modifiedQuestion.push(checkImage(arr, images, pdf_id))
        }
        arr = singleQReg.exec(question.substring(count))
        if (arr) {
            modifiedQuestion.push(checkImage(arr, images, pdf_id))
        }
        count = 0
    });
    return modifiedQuestion
}
//NEED TO TEST -> Doesn't really work
// while ((arr = multiQReg.exec(question)) !== null) {
// count += arr[0].length
// let singleQ = singleQReg.exec(question.substring(count))
// if (singleQ) {
// modifiedQuestion.push(checkImage(singleQ, images, pdf_id))
// }
// question = question.substring(0, count - 2)
// count = 0;
// }
// let singleQ = singleQReg.exec(question)
// if (singleQ) {
// modifiedQuestion.push(checkImage(singleQ, images, pdf_id))
// }
// count = 0;
//npm run reset
//ts-node-esm prisma/seed.ts
//npx prisma studio 

const checkImage = (arr, images, pdf_id) => {
    let question = new Array<QuestionPart>()
    arr.shift()
    arr.forEach(element => {
        let part: QuestionPart = {
            content: element,
            hasImage: false,
        }
        if (element.includes('includegraphics')) {
            console.log(element)
            part.hasImage = true
            const imageid = `${element.substring(element.search(pdf_id)).match(/[^\}\{}]+/g)[0]}`.replaceAll(/\(/g, '\\\(').replaceAll(/\)/g, '\\\)')
            console.log(imageid)
            const image = images.find(image => image.replaceAll(/\(/g, '\\\(').replaceAll(/\)/g, '\\\)').includes(imageid))
            const imageUrl = image.substring(image.search("https\:"), image.length - 2)
            console.log(imageUrl)
            part.imageLink = imageUrl
        }
        question.push(part)
    });
    //console.log(question)
    return question
}


//'2023_06_21_55f826e7aef9550a4dccg'
//'2023_06_20_6f00c60af0637a2a7afbg'
//2023_06_26_c43f04fde2b3f43e8da8g -> this one is weird
app.post("/convert-test", async (req, res) => {
    console.log("test")
    try {
        const headers = {
            'app_id': "boilerexams_gmail_com_a7d9fe_0dc934",
            'app_key': "9d23dece308b5305a40efa607a7869ad46c10cf18730632581905b537026a8d4",
            'Content-Type': 'application/json'
        }
        //'2023_06_20_6f00c60af0637a2a7afbg'
        //2023_06_25_d25c2986903bb495d7edg
        //2023_06_21_55f826e7aef9550a4dccg
        //2023_06_25_71ec7181e0d7aba87642g
        //2023_06_19_d67ee4497ecd37894300g -> CS
        ////'2023_06_19_d67ee4497ecd37894300g' -> cs, the one that worked with pdf
        //'2023_06_28_75fdd6edc01be3a36ec9g' -> CS
        //2023_06_25_d25c2986903bb495d7edg
        const pdf_id = req.body.pdf_id
        console.log(pdf_id)
        const url = "https://api.mathpix.com/v3/pdf/".concat(pdf_id)
        let respond = await axios.get(url, {
            headers: headers
        })
        while (respond.data.status != "completed") {
            await new Promise(f => setTimeout(f, 10000));
            respond = await axios.get(url, {
                headers: headers
            })
        }
        axios.get(url.concat(".tex"), {
            headers: headers
        }).then(async (content) => {
            const questions = await parseQuestions(content, pdf_id, req.body.choices)
            console.log(questions)
            res.status(200).send(questions)
        })
    } catch (err) {
        console.log(err)
        res.status(400).send(err);
    }
})


//2023_06_28_75fdd6edc01be3a36ec9g
app.post("/convert-file", upload.single("file"), async (req, res) => {
    if (!req.file) {
        throw Error
    }
    const data = new FormData();
    console.log(req.file)
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
        'app_key': "9d23dece308b5305a40efa607a7869ad46c10cf18730632581905b537026a8d4",
        'Content-Type': 'multipart/form-data',
        ...data.getHeaders()
    },
        data: data
    }
    axios.request(config)
    .then(async (id) => {
        const headers = {
            'app_id': "boilerexams_gmail_com_a7d9fe_0dc934",
            'app_key': "9d23dece308b5305a40efa607a7869ad46c10cf18730632581905b537026a8d4",
            'Content-Type': 'application/json'
        }
        console.log(id.pdf_id)
        const url = "https://api.mathpix.com/v3/pdf/".concat(id.pdf_id)
        console.log(url)
        let respond = await axios.get(url, {
            headers: headers
        })
        while (respond.data.status != "completed") {
            await new Promise(f => setTimeout(f, 10000));
            respond = await axios.get(url, {
                headers: headers
            })
        }
        axios.get(url.concat(".tex"), {
            headers: headers
        }).then(async (content) => {
            const questions = await parseQuestions(content, id.pdf_id, req.body.choices)
            res.status(200).send(questions)
        })
    })
})

module.exports = app;
export { }
