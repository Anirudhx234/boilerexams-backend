import axios from "axios";
import { NotFoundError } from "../../middleware/errors/index.js";

const getPDFResult = async (pdf_id: string) => {
    const headers = {
        app_id: process.env["MATHPIX_ID"],
        app_key: process.env["MATHPIX_KEY"],
    };
    const url = "https://api.mathpix.com/v3/pdf/".concat(pdf_id);
    const response = await axios.get(url, {
        headers: headers,
    });
    if (response.data.error) {
        throw new NotFoundError("Requested PDF not found");
    }
    if (response.data.status != "completed") {
        await new Promise((f) => setTimeout(f, 15000));
    }

    const content = await axios.get(url.concat(".tex"), {
        headers: headers,
    });

    return content.data;
};

export default getPDFResult;
