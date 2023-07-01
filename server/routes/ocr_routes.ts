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
})


interface QuestionPart {
    content: string,
    hasImage: boolean,
    imageLinks?: string[]
}
    
app.post("/convert-link", async (req, res) => {
    try {
        const headers = {
            'app_id': process.env.MATHPIX_ID,
            'app_key': process.env.MATHPIX_KEY,
            'Content-Type': 'application/json'
        }
        axios.post("https://api.mathpix.com/v3/pdf", {
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
        }).then((id) => {
            console.log(id.data.pdf_id)
            res.status(200).send(id.data.pdf_id)
        })
        // const pdf_id = id.data.pdf_id
        // const url = "https://api.mathpix.com/v3/pdf/".concat(pdf_id)
        // console.log(url)
        // let respond = await axios.get(url, {
        //     headers: headers
        // })
        // while (respond.data.status != "completed") {
        //     await new Promise(f => setTimeout(f, 10000));
        //     respond = await axios.get(url, {
        //         headers: headers
        //     })
        // }
        // axios.get(url.concat(".tex"), {
        // headers: headers
        // }).then(async (content) => {
        //     const questions = await parseQuestions(content, pdf_id, req.body.choices)
        //     res.status(200).send(questions)
        // })
    } catch (err) {
        console.log(err)
        res.status(400).send(err);
    }
})
        
        
    
    
const parseQuestions = async (content, choices) => {
    //console.log(content.data)
    const regex1 = /\\[a-z]+\{enumerate\}/g
    const regex2 = /\\setcounter\{enumi\}\{[0-9]*\}/g
    const questions = content.data.substring(content.data.search('begin\{document\}') + 15, content.data.search('\\end\{document\}')).replaceAll(regex1, '').replaceAll(regex2, '').split(/\\item|\\section/)
    const images = content.data.substring(content.data.search('\\end\{document\}')).match(/(.+)(https:\/\/cdn.mathpix.com\/.+)PK/g)

    // let arr
    // let count = 0
    let modifiedQuestion = new Array<QuestionPart[]>()
    let qs = 0


    questions.forEach(question => {
        //switch statement for choices here
        // let multiQReg;
        // let singleQReg;
        
        // switch(choices) {
        //     case "4":
        //         multiQReg = /(.+)\n(\(*[Aa][\.\)].+)\n(\(*[Bb][\.\)].+)\n(\(*[Cc][\.\)].+)\n(\(*[Dd][\.\)].+)[0-9]+\./gs
        //         singleQReg = /(.+)\n(\(*[Aa][\.\)].+)\n(\(*[Bb][\.\)].+)\n(\(*[Cc][\.\)].+)\n(\(*[Dd][\.\)].+)/gs
        //         break;
        //     case "5":
        //         multiQReg = /(.+)\n(\(*[Aa][\.\)].+)\n(\(*[Bb][\.\)].+)\n(\(*[Cc][\.\)].+)\n(\(*[Dd][\.\)].+)\n(\(*[Ee][\.\)].+)[0-9]+\./gs
        //         singleQReg = /(.+)\n(\(*[Aa][\.\)].+)\n(\(*[Bb][\.\)].+)\n(\(*[Cc][\.\)].+)\n(\(*[Dd][\.\)].+)\n(\(*[Ee][\.\)].+)/gs
        //         break;
        //     case "6":
        //         multiQReg = /(.+)\n(\(*[Aa][\.\)].+)\n(\(*[Bb][\.\)].+)\n(\(*[Cc][\.\)].+)\n(\(*[Dd][\.\)].+)\n(\(*[Ee][\.\)].+)\n(\(*[Ff][\.\)].+)[0-9]+\./gs
        //         singleQReg = /(.+)\n(\(*[Aa][\.\)].+)\n(\(*[Bb][\.\)].+)\n(\(*[Cc][\.\)].+)\n(\(*[Dd][\.\)].+)\n(\(*[Ee][\.\)].+)\n(\(*[Ff][\.\)].+)/gs
        //         break;
        // }
        // while ((arr = multiQReg.exec(question)) !== null) {
        //     count += arr[0].length
        //     modifiedQuestion.push(checkImage(arr, images, pdf_id))
        // }
        // arr = singleQReg.exec(question.substring(count))
        // if (arr) {
        //     modifiedQuestion.push(checkImage(arr, images, pdf_id))
        // }
        // count = 0



        let multiQ
        let singleQ
        let q = question


        let mQR, sQR


        switch(choices) {
            case "4":
                mQR = /(.+)(\(*[Aa][\.\)].+)(\(*[Bb][\.\)].+)(\(*[Cc][\.\)].+)(\(*[Dd][\.\)].+)[0-9]+[\.\)]/s
                sQR = /(.+)(\(*[Aa][\.\)].+)(\(*[Bb][\.\)].+)(\(*[Cc][\.\)].+)(\(*[Dd][\.\)].+)/s
                break;
            case "5":
                mQR = /(.+)(\(*[Aa][\.\)].+)(\(*[Bb][\.\)].+)(\(*[Cc][\.\)].+)(\(*[Dd][\.\)].+)(\(*[Ee][\.\)].+)[0-9]+[\.\)]/s
                sQR = /(.+)(\(*[Aa][\.\)].+)(\(*[Bb][\.\)].+)(\(*[Cc][\.\)].+)(\(*[Dd][\.\)].+)(\(*[Ee][\.\)].+)/s
                break;
            case "6":
                mQR = /(.+)(\(*[Aa][\.\)].+)(\(*[Bb][\.\)].+)(\(*[Cc][\.\)].+)(\(*[Dd][\.\)].+)(\(*[Ee][\.\)].+)(\(*[Ff][\.\)].+)[0-9]+[\.\)]/s
                sQR = /(.+)(\(*[Aa][\.\)].+)(\(*[Bb][\.\)].+)(\(*[Cc][\.\)].+)(\(*[Dd][\.\)].+)(\(*[Ee][\.\)].+)(\(*[Ff][\.\)].+)/s
                break;
        }

        let section = new Array<QuestionPart[]>()
        //console.log("-------------NEW QUESTION------------")
        //console.log(`question=${q}`)
        while (multiQ = q.match(mQR)) {
            //console.log(`Found multiQ ${multiQ}`)
            if (singleQ = q.substring(multiQ[0].length).match(sQR)) {
                //console.log(`Parsed singleQ=${singleQ}`)
                section.push(checkImage(singleQ, images))
                qs += 1
            }
            q = q.substring(0, multiQ[0].length - 2)
            //console.log(`current q=${q}`)
        }
        if (singleQ = q.match(sQR)) {
            //console.log(`Parsed singleQ=${singleQ}`)
            section.push(checkImage(singleQ, images))
            qs += 1
        }
        //console.log(`SECTION:${section}`)
        modifiedQuestion = modifiedQuestion.concat(section.reverse())
    });
    console.log(qs)
    console.log(modifiedQuestion)
    return modifiedQuestion
}



// let multiQ
// let singleQ
// let q = question


// let mQR, sQR


// switch(choices) {
// case "4":
// mQR = /(.+)\n(\(*[Aa][\.\)].+)\n(\(*[Bb][\.\)].+)\n(\(*[Cc][\.\)].+)\n(\(*[Dd][\.\)].+)[0-9]+\./s
// sQR = /(.+)\n(\(*[Aa][\.\)].+)\n(\(*[Bb][\.\)].+)\n(\(*[Cc][\.\)].+)\n(\(*[Dd][\.\)].+)/s
// break;
// case "5":
// mQR = /(.+)\n(\(*[Aa][\.\)].+)\n(\(*[Bb][\.\)].+)\n(\(*[Cc][\.\)].+)\n(\(*[Dd][\.\)].+)\n(\(*[Ee][\.\)].+)[0-9]+\./s
// sQR = /(.+)(\(*[Aa][\.\)].+)\n(\(*[Bb][\.\)].+)\n(\(*[Cc][\.\)].+)\n(\(*[Dd][\.\)].+)\n(\(*[Ee][\.\)].+)/s
// break;
// case "6":
// mQR = /(.+)\n(\(*[Aa][\.\)].+)\n(\(*[Bb][\.\)].+)\n(\(*[Cc][\.\)].+)\n(\(*[Dd][\.\)].+)\n(\(*[Ee][\.\)].+)\n(\(*[Ff][\.\)].+)[0-9]+\./s
// sQR = /(.+)\n(\(*[Aa][\.\)].+)\n(\(*[Bb][\.\)].+)\n(\(*[Cc][\.\)].+)\n(\(*[Dd][\.\)].+)\n(\(*[Ee][\.\)].+)\n(\(*[Ff][\.\)].+)/s
// break;
// }
// console.log("-------------NEW QUESTION------------")
// console.log(`question=${q}`)
// while (multiQ = q.match(mQR)) {
// console.log(`Found multiQ ${multiQ[0]}`)
// q = q.substring(multiQ[0].length)
// console.log(`current q=${q}`)
// modifiedQuestion.push(multiQ)
// }
// if (singleQ = q.match(sQR)) {
// console.log(`Found singleQ=${singleQ[0]}`)
// modifiedQuestion.push(singleQ)
// }


const checkImage = (arr, images) => {
    let question = new Array<QuestionPart>()
    arr.shift()
    arr.forEach(element => {
        let part: QuestionPart = {
            content: element,
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
            console.log(part.imageLinks)
        }
        // if (element.includes('includegraphics')) {
        //     console.log(element)
        //     const statement = `${element.match(/includegraphics.+\{([^\}\{]+)\}/gs)}`
        //     console.log(`statement=${statement}`)
        //     part.hasImage = true
        //     const imageid = `${element.substring(element.search(pdf_id)).match(/[^\}\{\\]+/g)[0]}`.replaceAll(/\(/g, '\\\(').replaceAll(/\)/g, '\\\)')
        //     console.log(imageid)
        //     const image = images.find(image => image.replaceAll(/\(/g, '\\\(').replaceAll(/\)/g, '\\\)').includes(imageid))
        //     const imageUrl = image.substring(image.search("https\:"), image.length - 2)
        //     part.imageLink = imageUrl
        // }
        question.push(part)
    });
    return question
}


//'2023_06_21_55f826e7aef9550a4dccg'
//'2023_06_20_6f00c60af0637a2a7afbg'
//2023_06_26_c43f04fde2b3f43e8da8g -> this one is weird
app.post("/convert-id", async (req, res) => {
    console.log("converting by id")
    try {
        const headers = {
            'app_id': process.env.MATHPIX_ID,
            'app_key': process.env.MATHPIX_KEY,
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
            const questions = await parseQuestions(content, req.body.choices)
            //console.log(questions)
            //console.log(content.data.substring(content.data.search('begin\{document\}') + 15, content.data.search('\\end\{document\}')))
            res.status(200).send(questions)
        })
    } catch (err) {
        console.log(err)
        res.status(400).send(err);
    }
})


//2023_06_28_75fdd6edc01be3a36ec9g
//2023_06_28_5d29a85a83a19b1dd0a7g
app.post("/convert-file", upload.single("file"), async (req, res) => {
    try {
        console.log(req.file)
        if (!req.file) {
            throw Error
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
        axios.request(config)
        .then((id) => {
            console.log(id.data.pdf_id)
            res.status(200).send(id.data.pdf_id)
        })
    } catch (err) {
        console.log(err)
        res.status(400).send(err);
    }
})

module.exports = app;
export { }
