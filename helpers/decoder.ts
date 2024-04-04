export default class FlagDecoder {

    public static course(flags: number): CourseFlags {
        return {
            published:  ((flags >> 0) & 1) === 1,
        };
    }

    public static exam(flags: number): ExamFlags {
        return {
            published:  ((flags >> 0) & 1) === 1,
            practice:   ((flags >> 1) & 1) === 1,
        };
    }

    public static question(flags: number): QuestionFlags {
        return {
            published:              ((flags >> 0) & 1) === 1,
            disableRandomAnswers:   ((flags >> 1) & 1) === 1,
            answersStartHidden:     ((flags >> 2) & 1) === 1,
        };
    }
}