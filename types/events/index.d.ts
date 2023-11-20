type NewEvent = {
    title: string | null;
    description: string | null;
    type: import("@prisma/client").EventType;
    start: Date;
    end: Date;
    location: string | null;
    courseId: string | null;
}