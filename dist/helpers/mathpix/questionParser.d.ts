interface QuestionPart {
    content: string;
    hasImage: boolean;
    imageLinks?: string[];
}
declare const parseQuestions: (content: any, choices: number) => QuestionPart[][];
export default parseQuestions;
