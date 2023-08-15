import express from 'express';
import auth from '../middleware/auth/auth.js';
import name_routes from "./name_routes.js";
import parsing from "./parsing.js";
import courses from "./courses.js";
import exams from "./exams.js";
import questions from "./questions.js";
import resources from "./resources.js";
import topics from "./topics.js";
import users from "./users.js";
import webhooks from "./webhooks.js";
import stats from "./stats.js";
import id_routes from "./id_routes.js";
const app = express();
app.use(auth, name_routes, id_routes, parsing, courses, exams, questions, resources, topics, users, webhooks, stats);
export default app;
//# sourceMappingURL=index.js.map