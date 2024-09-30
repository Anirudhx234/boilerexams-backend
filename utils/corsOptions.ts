import APIError from "../middleware/errors/APIError.js";

const vercelRegexp = new RegExp("https://boilerexams-frontend[^ ]*.vercel.app");
const emptyRegexp = new RegExp("https://boilerexams.com");
const prodRegexp = new RegExp("https://[^ ]*.boilerexams.com");
const httpRegexp = new RegExp("http://[^ ]*.backend.boilerexams.com");

const allowList = ["https://boilerclasses.com", "http://localhost:3000", "https://localhost:3000", "http://127.0.0.1:3000"];

const corsOptions = {
    origin: (origin: any, cb: any) => {
        if (allowList.includes(origin) || !origin || vercelRegexp.test(origin) || emptyRegexp.test(origin) || prodRegexp.test(origin) || httpRegexp.test(origin)) {
            cb(null, true);
        } else {
            cb(new APIError("Not allowed by CORS", 403));
        }
    },
    credentials: true,
    exposedHeaders: ["set-cookie"]
};

export default corsOptions;
