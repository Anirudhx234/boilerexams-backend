import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import session from 'express-session'
import connect from 'connect-pg-simple'
import passport from 'passport'
import routes from './routes/index'
import errorHandler from './middleware/errorHandler';
import { APIError } from './middleware/errors';

require('./middleware/auth/discordPassport')
require('./middleware/auth/googlePassport')

const app = express();

const regexp = new RegExp('https:\/\/boilerexams-frontend-[^ ]*-boilerexams.vercel.app');
const allowList = ["https://boilerexams-frontend.vercel.app", "http://localhost:3000", "http://127.0.0.1:3000"];

const corsOptions = {
  origin: (origin: any, cb: any) => {
    if (allowList.includes(origin) || !origin || regexp.test(origin)) {
      cb(null, true)
    } else {
      cb(new APIError('Not allowed by CORS', 403))
    }
  },
  credentials: true,
  exposedHeaders: ["set-cookie"]
};


app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());

app.set('trust proxy', 1)
app.use(session({
  store: new (connect(session))({
    conString: process.env.DATABASE_URL,
    tableName: 'Session',
    createTableIfMissing: true
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'none', secure: true, maxAge: 7 * 24 * 60 * 60 * 1000 },
  name: 'sessionId'
}))
app.use(passport.initialize())
app.use(passport.session())

app.use(routes)

app.use(errorHandler);

app.get("/", (req, res) => {
  res.send("Working")
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running at port ${PORT}`);
});

export default app