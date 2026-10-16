import { z } from 'zod';

export const photoAnalysisSchema = z.object({
  description: z
    .string()
    .min(1)
    .describe('A single-sentence description of the photo.'),
  tags: z
    .array(z.string().min(1))
    .min(3)
    .max(5)
    .describe('Three to five short lowercase tags.'),
});

export type PhotoAnalysis = z.infer<typeof photoAnalysisSchema>;
