import { z } from "zod";

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

export const MultipleChoiceSubmissionData = z.array(z.number());

export const FreeResponseSubmissionData = z.string();

export const ShortAnswerSubmissionData = FreeResponseSubmissionData;

export const FillInBlankSubmissionData = FillInBlankQuestionData;

export const ImageResourceData = z.object({
    key:        z.string(),
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

export const PdfResourceData = ImageResourceData;