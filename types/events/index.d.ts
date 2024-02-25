type NewEvent = {
    subject: string;
    number: number;
    title?: string;
    description?: string;
    type: "EXAM" | "FINAL";
    start: Date;
    end: Date;
    location: string | null;
    courseId: string | null;
};
