type StudyMode = "EXAM" | "TOPIC" | "TIMED_EXAM";

interface CreateCourseOptions {
    name: string;
    number: number;
    subject: string;
    abbreviation: string;
    backgroundColor: string;
    secondaryColor: string;
    graphicLink: string;
    studyModes: StudyMode[];
    disclaimer: string;
}

type QuestionSortCategory = {
    exam?: {
        semester?: {
            year?: "asc" | "desc";
            season?: "asc" | "desc";
        };
        number?: "asc" | "desc";
    };
    number?: "asc" | "desc";
};
