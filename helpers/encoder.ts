import { z } from "zod";
import { CourseFlagsScheme, ExamFlagsScheme, QuestionFlagsScheme } from "../prisma/schema.js";

export default class FlagEncoder {

    public static course(flags: z.infer<typeof CourseFlagsScheme>) {
        let encodedFlags = 0;

        if (flags.published)    encodedFlags |= (1 << 0);

        return encodedFlags;
    }

    public static exam(flags: z.infer<typeof ExamFlagsScheme>) {
        let encodedFlags = 0;

        if (flags.published)    encodedFlags |= (1 << 0);
        if (flags.practice )    encodedFlags |= (1 << 1);

        return encodedFlags;
    }

    public static question(flags: z.infer<typeof QuestionFlagsScheme>) {
        let encodedFlags = 0;

        if (flags.published)            encodedFlags |= (1 << 0);
        if (flags.disableRandomAnswers) encodedFlags |= (1 << 1);
        if (flags.answersStartHidden)   encodedFlags |= (1 << 2);

        return encodedFlags;
    }
}