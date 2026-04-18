import { z } from 'zod';

const optionalSlider = z.number().int().min(0).max(100).optional();

export const moodSchema = z.object({
  moodLabel: z.string().trim().min(1),
  energy: optionalSlider,
  stress: optionalSlider,
  confidence: optionalSlider,
  anxiety: optionalSlider,
  motivation: optionalSlider,
  focus: optionalSlider,
  note: z.string().trim().max(400).optional(),
});
