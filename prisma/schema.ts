import { z } from "zod";
import { FeedbackStatus, FeedbackType, Season, } from "@prisma/client";
import { randomUUID } from "node:crypto";
import { ExamFlags } from "../controllers/examController.js";


export const Epoch = new Date(2019, 10);

export const CreateExamScheme = z.object({
    number:     z.number(),
    year:       z.number(),
    season:     z.nativeEnum(Season),
    disclaimer: z.string().optional(),
    flags:      ExamFlags.optional().default({  })
});

export const UpdateExamScheme = CreateExamScheme;

export const ReorderQuestions = z.array(z.string().uuid());

export const FeatureRequestData = z.object({
    title:      z.string(),
    content:    z.string().max(2000),
    contact:    z.string().max(50).optional(),
});

export const QuestionReportData = FeatureRequestData.extend({
    userAgent:  z.string().optional(),
});

export const BugReportData = QuestionReportData.extend({
    location:   z.string(),
});

export const VideoFeedbackData = z.object({
    explanationQuality: z.number().min(1).max(5),
    productionQuality:  z.number().min(1).max(5),
    recommended:        z.boolean(),
    content:            z.string().optional()
});

export const BaseFeedbackScheme = z.object({
    id:         z.string().uuid().default(randomUUID),
    type:       z.nativeEnum(FeedbackType),
    status:     z.nativeEnum(FeedbackStatus).default(FeedbackStatus.OPEN),
    data:       z.object({}),
    userId:     z.string().uuid().optional(),
    questionId: z.string().uuid().optional(),
});

export const BugReportScheme = BaseFeedbackScheme.extend({
    type:   z.literal(FeedbackType.BUG_REPORT),
    data:   BugReportData
});

export const QuestionReportScheme = BaseFeedbackScheme.extend({
    type:   z.literal(FeedbackType.QUESTION_REPORT),
    data:   QuestionReportData
});

export const FeatureRequestScheme = BaseFeedbackScheme.extend({
    type:   z.literal(FeedbackType.FEATURE_REQUEST),
    data:   FeatureRequestData
});

export const VideoFeedbackScheme = BaseFeedbackScheme.extend({
    type:   z.literal(FeedbackType.VIDEO_FEEDBACK),
    data:   VideoFeedbackData
});

export const CourseRequestScheme = BaseFeedbackScheme.extend({
    abbreviation:   z.string().toUpperCase(),
    number:         z.number().min(100).max(99999)
});
