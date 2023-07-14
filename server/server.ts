import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import routes from './routes/index'
import errorHandler from './middleware/errorHandler';

const app = express();

const regexp = new RegExp('https:\/\/boilerexams-frontend-[^ ]*-boilerexams.vercel.app');
const allowList = ["https://boilerexams-frontend.vercel.app", "http://localhost:3000", "http://127.0.0.1:3000"];

const corsOptions = {
  origin: (origin: any, cb: any) => {
    if (allowList.includes(origin) || !origin || regexp.test(origin)) {
      cb(null, true)
    } else {
      cb(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  exposedHeaders: ["set-cookie"]
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

export default app