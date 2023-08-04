import express from 'express'
import auth from '../middleware/auth/auth'

import name_routes from "./name_routes"
import parsing from "./parsing"
import courses from "./courses"
import exams from "./exams"
import questions from "./questions"
import resources from "./resources"
import topics from "./topics"
import users from "./users"
import webhooks from "./webhooks"
import stats from "./stats"
import id_routes from "./id_routes"
const app = express();

app.use(auth, name_routes, id_routes, parsing, courses, exams, questions, resources, topics, users, webhooks, stats);

export default app