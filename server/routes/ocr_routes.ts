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

module.exports = app;
export { }
