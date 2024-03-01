import { z } from "zod";
import { QuestionType, ResourceType, Season, StudyMode } from "@prisma/client";

export const MultipleChoiceAnswerChoice = z.object({
    index:      z.number(),
    body:       z.string().optional(),
    resourceId: z.string().optional(),
});

export const MultipleChoiceQuestionData = z.object({
    body:           z.string(),
    answerChoices:  z.array(MultipleChoiceAnswerChoice),
    solution:       z.array(z.number()),
});

export const FreeResponseQuestionData = z.object({
    body:       z.string().optional(),
    resourceId: z.string().optional(),
    solution:   z.string().optional(),
});

export const ShortAnswerQuestionData = FreeResponseQuestionData;

export const FillInBlankQuestionData = FreeResponseQuestionData;

export const MultipleChoiceSubmissionData = z.array(
    z.number()
);

export const FreeResponseSubmissionData = z.string();

export const ShortAnswerSubmissionData = FreeResponseSubmissionData;

export const FillInBlankSubmissionData = FillInBlankQuestionData;

export const ImageResourceData = z.object({
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

export const PdfResourceData = ImageResourceData; // Weird lil data

export const CreateResourceScheme = z.object({
    id:     z.string().uuid().optional(),
    type:   z.nativeEnum(ResourceType),
});

export const ResourceScheme = CreateResourceScheme.extend({
    id:     z.string().uuid(),
});

export const CreateImageResourceScheme = CreateResourceScheme.extend({
    type:   z.literal(ResourceType.IMAGE),
    data:   ImageResourceData,
});

export const CreateVideoResourceScheme = CreateResourceScheme.extend({
    type:   z.literal(ResourceType.VIDEO),
    data:   VideoResourceData,
});

export const CreateCodeResourceScheme = CreateResourceScheme.extend({
    type:   z.literal(ResourceType.CODE),
    data:   CodeResourceData,
});

export const CreatePdfResourceScheme = CreateResourceScheme.extend({
    type:   z.literal(ResourceType.PDF),
    data:   PdfResourceData,
});

export const ImageResourceScheme = ResourceScheme.extend({
    type:   z.literal(ResourceType.IMAGE),
    data:   ImageResourceData,
});

export const VideoResourceScheme = ResourceScheme.extend({
    type:   z.literal(ResourceType.VIDEO),
    data:   VideoResourceData,
});

export const CodeResourceScheme = ResourceScheme.extend({
    type:   z.literal(ResourceType.CODE),
    data:   CodeResourceData,
});

export const PdfResourceScheme = ResourceScheme.extend({
    type:   z.literal(ResourceType.IMAGE),
    data:   ImageResourceData,
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
    modes:          z.array(z.nativeEnum(StudyMode)),
    graphic:        z.union([ CreateImageResourceScheme, ImageResourceScheme ]).optional(),
});

export const UpdateCourseScheme = CreateCourseScheme;

export const CreateExamScheme = z.object({
    number:     z.number(),
    year:       z.number(),
    season:     z.nativeEnum(Season),
    disclaimer: z.string().optional(),
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
    parentId:   z.string().uuid().optional()
});

export const UpdateQuestionScheme = CreateQuestionScheme.extend({

});