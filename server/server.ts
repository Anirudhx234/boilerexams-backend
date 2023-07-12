const express = require("express");

const app = express();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const errorHandler = require('./middleware/errorHandler');

const regexp = new RegExp('https:\/\/boilerexams-frontend-[^ ]*-boilerexams.vercel.app');
const allowList = ["https://boilerexams-frontend.vercel.app", "http://localhost:3000"];

const corsOptions = {
  origin: (origin: any, cb: any) => {
    if (allowList.includes(origin) || !origin || regexp.test(origin)) {
      cb(null, true)
    } else {
      cb(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());

const id_routes = require("./routes/id_routes");
const name_routes = require("./routes/name_routes");
const post_routes = require("./routes/post_routes");
const ocr_routes = require("./routes/ocr_routes");
const put_routes = require("./routes/put_routes");
const delete_routes = require("./routes/delete_routes");
const resources_routes = require("./routes/resources.ts");
const users_routes = require("./routes/users.ts");
app.use(id_routes, name_routes, post_routes, ocr_routes, put_routes, delete_routes, resources_routes, users_routes);

app.use(errorHandler);

app.get("/", (req, res) => {
  res.send("Working");
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running at port ${PORT}`);
});

module.exports = app;
export { }