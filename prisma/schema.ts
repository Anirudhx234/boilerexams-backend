import { z } from "zod";
import { FeedbackStatus, FeedbackType, QuestionType, Season, StudyMode } from "@prisma/client";
import { randomUUID } from "node:crypto";

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

export const UrlResourceData = z.object({
    url:        z.string().url(),
    key:        z.string().optional(),
    index:      z.number().optional(),
    altText:    z.string().optional()
});

export const CodeResourceData = z.object({
    language:   z.enum([ "C", "JAVA", "PYTHON" ]),
    content:    z.string(),
    index:      z.number().optional()
});

export const ResourceScheme = z.object({});

export const CreateTopicScheme = z.object({
    id:     z.string().uuid().default(randomUUID),
    name:   z.string().max(50, "Topic name must be <= 50 characters"),
});

export const UpdateTopicScheme = CreateTopicScheme.extend({
    id: z.string().uuid(),
});

export const CourseFlagsScheme = z.object({
    published: z.boolean().optional(),
});

export const ExamFlagsScheme = z.object({
    published:  z.boolean().optional(),
    practice:   z.boolean().optional(),
});

export const QuestionFlagsScheme = z.object({
    published:              z.boolean().optional(),
    disableRandomAnswers:   z.boolean().optional(),
    answersStartHidden:     z.boolean().optional()
});

export const CourseResolvable = z.union([
    z.object({
        id: z.string().uuid()
    }),
    z.object({
        abbreviation_number: z.object({
            abbreviation:   z.string(),
            number:         z.number().min(10000).max(99999)
        })
    })
]);

export const ExamResolvable = z.union([
    z.object({
        id: z.string().uuid(),
    }),
    z.object({
        number_year_season_courseId: z.object({
            number:     z.number().min(0).max(5),
            year:       z.number().min(1970).max(2070),
            season:     z.nativeEnum(Season),
            courseId:   z.string().uuid()
        })
    })
]);

export const TopicResolvable = z.union([
    z.object({
        id: z.string().uuid(),
    }),
    z.object({
        name_courseId: z.object({
            name:       z.string(),
            courseId:   z.string().uuid()
        })
    })
]);

export const QuestionResolvable = z.union([
   z.object({
       id: z.string().uuid()
   }),
    z.object({
        number_examId: z.object({
            number: z.number().min(1),
            examId: z.string().uuid(),
        })
    })
]);

export const CreateCourseScheme = z.object({
    abbreviation:   z.string(),
    number:         z.number(),
    color:          z.string().optional(),
    disclaimer:     z.string().optional(),
    modes:          z.array(z.nativeEnum(StudyMode)).default([ StudyMode.EXAM, StudyMode.TIMED_EXAM, StudyMode.TOPIC ]),
    flags:          CourseFlagsScheme.optional().default({  }),
});

export const UpdateCourseScheme = CreateCourseScheme;

export const CreateExamScheme = z.object({
    number:     z.number(),
    year:       z.number(),
    season:     z.nativeEnum(Season),
    disclaimer: z.string().optional(),
    flags:      ExamFlagsScheme.optional().default({  })
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
    flags:      QuestionFlagsScheme.optional().default({  }),
});

export const UpdateQuestionScheme = CreateQuestionScheme.extend({
    topics:     z.array(z.union([ CreateTopicScheme, UpdateTopicScheme ])),
});

export const UpdateSubmissionScheme = z.object({
    timeStarted:    z.coerce.date().min(Epoch),
    timeEnded:      z.coerce.date().max(new Date()),
    timeSpent:      z.number(),
    timeSpentVideo: z.number().default(0),
    timeSpentModal: z.number().default(0),
});

export const CreateSubmissionScheme = UpdateSubmissionScheme.extend({
    type:           z.nativeEnum(QuestionType),
    data:           z.union([
        MultipleChoiceSubmissionData,
        FreeResponseSubmissionData,
        ShortAnswerSubmissionData,
        FillInBlankSubmissionData
    ]),
    correct:        z.boolean(),
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