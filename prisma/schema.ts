import { z } from "zod";

export const Epoch = new Date(2019, 10);

export const ReorderQuestions = z.array(z.string().uuid());