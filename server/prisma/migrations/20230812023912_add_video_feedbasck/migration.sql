-- CreateTable
CREATE TABLE "VideoFeedback" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "explanationQuality" INTEGER NOT NULL,
    "productionQuality" INTEGER NOT NULL,
    "videoRecommendation" BOOLEAN NOT NULL,
    "additionalFeedback" TEXT NOT NULL,

    CONSTRAINT "VideoFeedback_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "VideoFeedback" ADD CONSTRAINT "VideoFeedback_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;