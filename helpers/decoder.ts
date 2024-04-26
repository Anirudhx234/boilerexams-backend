import { z } from "zod";
import { CourseFlags } from "../controllers/courseController.js";
import { ExamFlags } from "../controllers/examController.js";
import { QuestionFlags } from "../controllers/questionController.js";

export default class FlagDecoder {
    public static course(flags: number): z.infer<typeof CourseFlags> {
        return {
            published: ((flags >> 0) & 1) === 1,
            invertImageColors: ((flags >> 1) & 1) === 1
        };
    }

    public static exam(flags: number): z.infer<typeof ExamFlags> {
        return {
            published: ((flags >> 0) & 1) === 1,
            practice: ((flags >> 1) & 1) === 1
        };
    }

    public static question(flags: number): z.infer<typeof QuestionFlags> {
        return {
            published: ((flags >> 0) & 1) === 1,
            disableRandomAnswers: ((flags >> 1) & 1) === 1,
            answersStartHidden: ((flags >> 2) & 1) === 1
        };
    }
}
