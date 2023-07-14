import express from 'express'
import name_routes from "./name_routes"
import ocr_routes from "./ocr_routes"
import courses from "./courses"
import exams from "./exams"
import questions from "./questions"
import resources from "./resources"
import topics from "./topics"
import users from "./users"
import webhooks from "./webhooks"

const app = express();

app.use(name_routes, ocr_routes, courses, exams, questions, resources, topics, users, webhooks);

export default app