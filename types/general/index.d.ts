interface Subject {
    name:       string
    courses:    object[]
}

interface CourseFlags {
    published:  boolean
}

interface ExamFlags {
    published:  boolean
    practice:   boolean
}

interface QuestionFlags {
    published:              boolean
    disableRandomAnswers:   boolean
    answersStartHidden:     boolean
}