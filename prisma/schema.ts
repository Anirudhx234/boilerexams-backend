import { z } from "zod";
import { FeedbackStatus, FeedbackType, QuestionType, Season, StudyMode } from "@prisma/client";
import { randomUUID } from "node:crypto";
import { CreateTopic, UpdateTopic } from "../controllers/topicController.js";
import { CourseFlags } from "../controllers/courseController.js";
import { ExamFlags } from "../controllers/examController.js";
import { QuestionFlags } from "../controllers/questionController.js";

const coerceBigIntSafely = (input) => {
    if (input !== undefined) {
        return BigInt(input);
    }
    return input;
};

export const Epoch = new Date(2019, 10);

export const MultipleChoiceAnswerChoice = z.object({
    index:  z.number(),
    body:   z.string().optional(),
});

export const MultipleChoiceQuestionData = z.object({
    body:           z.string().optional(),
    answerChoices:  z.array(MultipleChoiceAnswerChoice),
    solution:       z.array(z.number()),
});

export const FreeResponseQuestionData = z.object({
    body:       z.string().optional(),
    solution:   z.string().optional(),
});

export const ShortAnswerQuestionData = FreeResponseQuestionData;

export const FillInBlankQuestionData = FreeResponseQuestionData;

export const MultipleChoiceSubmissionData = z.array(z.number());

export const FreeResponseSubmissionData = z.string().optional();

export const ShortAnswerSubmissionData = FreeResponseSubmissionData;

export const FillInBlankSubmissionData = FillInBlankQuestionData;

export const CreateExamScheme = z.object({
    number:     z.number(),
    year:       z.number(),
    season:     z.nativeEnum(Season),
    disclaimer: z.string().optional(),
    flags:      ExamFlags.optional().default({  })
});

export const UpdateExamScheme = CreateExamScheme;

export const CreateQuestionScheme = z.object({
    type:       z.nativeEnum(QuestionType),
    data:       z.union([
        MultipleChoiceQuestionData,
        ShortAnswerQuestionData,
        FillInBlankQuestionData,
        FreeResponseQuestionData
    ]),
    number:     z.number().min(1),
    disclaimer: z.string().optional(),
    parentId:   z.string().uuid().optional(),
    flags:      QuestionFlags.optional().default({  }),
});

export const UpdateQuestionScheme = CreateQuestionScheme.extend({
    topics:     z.array(z.union([ CreateTopic, UpdateTopic ])),
});

export const UpdateSubmissionScheme = z.object({
    correct: z.boolean().optional(),
    timeStarted: z.coerce.date().min(Epoch).optional(),
    timeEnded: z.coerce.date().refine(date => date < new Date()).optional(),
    timeSpent: z.preprocess(coerceBigIntSafely, z.bigint()).optional(),
    timeSpentVideo: z.preprocess(coerceBigIntSafely, z.bigint()).optional(),
    timeSpentModal: z.preprocess(coerceBigIntSafely, z.bigint()).optional(),
});

export const CreateSubmissionScheme = z.object({
    type:           z.nativeEnum(QuestionType),
    userSolution:           z.union([
        MultipleChoiceSubmissionData,
        FreeResponseSubmissionData,
        ShortAnswerSubmissionData,
        FillInBlankSubmissionData
    ]),
    correct: z.boolean(),
    timeStarted: z.coerce.date().min(Epoch),
    timeEnded: z.coerce.date().refine(date => date < new Date()),
    timeSpent: z.preprocess(coerceBigIntSafely, z.bigint()),
    timeSpentVideo: z.preprocess(coerceBigIntSafely, z.bigint()),
    timeSpentModal: z.preprocess(coerceBigIntSafely, z.bigint()),
    osFamily:       z.string().optional(),
});

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
