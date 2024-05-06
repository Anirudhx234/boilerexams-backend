-- AlterTable
ALTER TABLE "Feedback" ADD COLUMN     "customExamId" TEXT;

-- AlterTable
ALTER TABLE "Resource" ADD COLUMN     "customExamId" TEXT;

-- CreateTable
CREATE TABLE "CustomExam" (
    "id" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "name" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "referencedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "stats" JSONB,

    CONSTRAINT "CustomExam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CustomExamToQuestion" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "CustomExam_name_courseId_key" ON "CustomExam"("name", "courseId");

-- CreateIndex
CREATE UNIQUE INDEX "_CustomExamToQuestion_AB_unique" ON "_CustomExamToQuestion"("A", "B");

-- CreateIndex
CREATE INDEX "_CustomExamToQuestion_B_index" ON "_CustomExamToQuestion"("B");

-- AddForeignKey
ALTER TABLE "CustomExam" ADD CONSTRAINT "CustomExam_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CustomExamToQuestion" ADD CONSTRAINT "_CustomExamToQuestion_A_fkey" FOREIGN KEY ("A") REFERENCES "CustomExam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CustomExamToQuestion" ADD CONSTRAINT "_CustomExamToQuestion_B_fkey" FOREIGN KEY ("B") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;
