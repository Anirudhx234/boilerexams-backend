//const vercelRegexp = new RegExp("https://boilerexams-frontend[^ ]*.vercel.app");
//const prodRegexp = new RegExp("https://[^ ]*.boilerexams.com");

//const allowList = ["https://boilerclasses.com", "http://localhost:3000", "https://localhost:3000", "http://127.0.0.1:3000"];

const corsOptions = {
    origin: (origin: any, cb: any) => {
       cb(null, true);
    },
    credentials: true,
    exposedHeaders: ["set-cookie"],
};


export default corsOptions;
