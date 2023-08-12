import express from 'express';
import { Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import session from 'express-session'
import connect from 'connect-pg-simple'
import passport from 'passport'
import routes from './routes/index'
import errorHandler from './middleware/errorHandler';
import { APIError } from './middleware/errors';

import discordPassport from './middleware/auth/passport/discordPassport'
import googlePassport from './middleware/auth/passport/googlePassport'

const app = express();

discordPassport(passport);
googlePassport(passport);

const vercelRegexp = new RegExp('https:\/\/boilerexams-frontend[^ ]*.vercel.app');
const prodRegexp = new RegExp('https:\/\/[^ ]*.boilerexams.com')

const allowList = ["https://boilerexams-frontend.vercel.app", "https://boilerexams.com", "http://localhost:3000", "http://127.0.0.1:3000"];

const corsOptions = {
  origin: (origin: any, cb: any) => {
    if (allowList.includes(origin) || !origin || vercelRegexp.test(origin) || prodRegexp.test(origin)) {
      cb(null, true)
    } else {
      cb(new APIError('Not allowed by CORS', 403))
    }
  },
  credentials: true,
  exposedHeaders: ["set-cookie"]
};

app.use('/favicon.ico', express.static('images/favicon.ico'));

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());

const sessionOptions = {
  store: new (connect(session))({
    conString: process.env.DATABASE_URL,
    tableName: 'Session',
    createTableIfMissing: true
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: "strict", secure: false, maxAge: 7 * 24 * 60 * 60 * 1000 },
  name: 'sessionId'
}

//if (process.env.NODE_ENV === "production") {
//  app.set('trust proxy', 1);
//  sessionOptions.cookie.secure = true
//}

//@ts-ignore
app.use(session(sessionOptions))
app.use(passport.initialize())
app.use(passport.session())

app.get("/", (req: Request, res: Response) => {
  res.send("Working")
});

app.use(routes)

app.use(errorHandler);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running at port ${PORT}`);
});

export default app