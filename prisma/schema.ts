import { z } from "zod";
import { QuestionType, ResourceType, Season, StudyMode } from "@prisma/client";
import { randomUUID } from "node:crypto";

export const MultipleChoiceAnswerChoice = z.object({
    index:          z.number(),
    body:           z.string().optional(),
});

export const MultipleChoiceQuestionData = z.object({
    body:           z.string(),
    answerChoices:  z.array(MultipleChoiceAnswerChoice),
    solution:       z.array(z.number()),
});

export const FreeResponseQuestionData = z.object({
    body:       z.string().optional(),
    solution:   z.string().optional(),
});

export const ShortAnswerQuestionData = FreeResponseQuestionData;

export const FillInBlankQuestionData = FreeResponseQuestionData;

export const MultipleChoiceSubmissionData = z.array(
    z.number()
);

export const FreeResponseSubmissionData = z.string().optional();

export const ShortAnswerSubmissionData = FreeResponseSubmissionData;

export const FillInBlankSubmissionData = FillInBlankQuestionData;

export const FileResourceData = z.object({
    key:        z.string().optional(),
    url:        z.string(),
    altText:    z.string().optional(),
});

export const VideoResourceData = z.object({
    url:    z.string()
});

export const CodeResourceData = z.object({
    language:   z.enum([ "C", "PYTHON" ]),
    content:    z.string(),
});

export const FileResourceScheme = z.object({
    id:     z.string().uuid().default(randomUUID),
    type:   z.union([
        z.literal(ResourceType.COURSE_LOGO),
        z.literal(ResourceType.QUESTION_IMAGE),
        z.literal(ResourceType.SOLUTION_IMAGE),
        z.literal(ResourceType.ANSWER_CHOICE_IMAGE),
        z.literal(ResourceType.EXAM_PDF),
        z.literal(ResourceType.RESUME_PDF)
    ]),
    data:   FileResourceData
});

export const VideoResourceScheme = z.object({
    id:     z.string().uuid().default(randomUUID),
    type:   z.union([
        z.literal(ResourceType.SHORT_SOLUTION_VIDEO),
        z.literal(ResourceType.LONG_SOLUTION_VIDEO),
    ]),
    data:   VideoResourceData
});

export const CodeResourceScheme = z.object({
    id:     z.string().uuid().default(randomUUID),
    type:   z.union([
        z.literal(ResourceType.QUESTION_CODE),
        z.literal(ResourceType.ANSWER_CHOICE_CODE),
    ]),
    data:   CodeResourceData
});

export const ResourceScheme = z.union([
    FileResourceScheme, VideoResourceScheme, CodeResourceScheme
]);

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
        number: z.number().min(1),
        examId: z.string().uuid(),
    })
]);

export const CreateCourseScheme = z.object({
    abbreviation:   z.string(),
    number:         z.number(),
    color:          z.string().optional(),
    disclaimer:     z.string().optional(),
    modes:          z.array(z.nativeEnum(StudyMode)).default([ StudyMode.EXAM, StudyMode.TIMED_EXAM, StudyMode.TOPIC ]),
    flags:          CourseFlagsScheme.optional().default({  }),
    resources:      z.array(ResourceScheme).optional().default([  ]),
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
    resources:  z.array(ResourceScheme).default([  ]),
});

export const CreateSubmissionScheme = z.object({
    type:           z.nativeEnum(QuestionType),
    data:           z.union([
        MultipleChoiceSubmissionData,
        FreeResponseSubmissionData,
        ShortAnswerSubmissionData,
        FillInBlankSubmissionData
    ]),
    correct:        z.boolean(),
    timeStarted:    z.coerce.date().min(new Date(2019, 10)),
    timeEnded:      z.coerce.date().max(new Date()),
    timeSpent:      z.number(),
    timeSpentVideo: z.number().default(0),
    timeSpentModal: z.number().default(0),
    osFamily:       z.string().optional(),
});

export const UpdateSubmissionScheme = z.object({
    timeStarted:    z.coerce.date().min(new Date(2019, 10)),
    timeEnded:      z.coerce.date().max(new Date()),
    timeSpent:      z.number(),
    timeSpentVideo: z.number().default(0),
    timeSpentModal: z.number().default(0),
});

export const ReorderQuestions = z.array(z.string().uuid());