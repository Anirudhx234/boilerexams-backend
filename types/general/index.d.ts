interface Subject {
    name: string;
    courses: object[];
}

interface CourseFlags {
    published: boolean;
}

interface ExamFlags {
    published: boolean;
    practice: boolean;
}

interface CustomExamFlags {
    permanent: boolean;
}

interface QuestionFlags {
    published: boolean;
    disableRandomAnswers: boolean;
    answersStartHidden: boolean;
}
