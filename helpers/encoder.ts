import { z } from "zod";
import { CourseFlags } from "../controllers/courseController.js";
import { ExamFlags } from "../controllers/examController.js";
import { QuestionFlags } from "../controllers/questionController.js";
import { CustomExamFlags } from "../controllers/customExamController.js";

export default class FlagEncoder {
    public static course(flags: z.infer<typeof CourseFlags>) {
        let encodedFlags = 0;

        if (flags.published) encodedFlags |= 1 << 0;
        if (flags.invertImageColors) encodedFlags |= 1 << 1;

        return encodedFlags;
    }

    public static exam(flags: z.infer<typeof ExamFlags>) {
        let encodedFlags = 0;

        if (flags.published) encodedFlags |= 1 << 0;
        if (flags.practice) encodedFlags |= 1 << 1;

        return encodedFlags;
    }

    public static customExam(flags: z.infer<typeof CustomExamFlags>) {
        let encodedFlags = 0;

        if (flags.permanent) encodedFlags |= 1 << 0;

        return encodedFlags;
    }

    public static question(flags: z.infer<typeof QuestionFlags>) {
        let encodedFlags = 0;

        if (flags.published) encodedFlags |= 1 << 0;
        if (flags.disableRandomAnswers) encodedFlags |= 1 << 1;
        if (flags.answersStartHidden) encodedFlags |= 1 << 2;

        return encodedFlags;
    }
}
