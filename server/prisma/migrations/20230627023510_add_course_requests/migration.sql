-- CreateTable
CREATE TABLE "CourseRequest" (
    "id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "course" TEXT NOT NULL,
    "requests" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "CourseRequest_pkey" PRIMARY KEY ("id")
);
