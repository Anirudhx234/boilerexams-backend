const express = require("express");

const app = express();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const routes = require('./routes/index')
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
app.use(routes)
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