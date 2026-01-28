import { z } from "zod";

export const ParseResultSchema = z.object({
  intent: z.literal("gift_search"),
  keywords: z.array(z.string()).min(1),
  categories: z.array(z.string()),
  price_range: z.object({
    min: z.number().nullable(),
    max: z.number().nullable(),
  }),
  age_range: z.object({
    min: z.number().nullable(),
    max: z.number().nullable(),
  }),
  notes: z.string(),
});

export const SearchRequestSchema = z.object({
  keywords: z.array(z.string()).min(1),
  categories: z.array(z.string()),
  price_range: z
    .object({
      min: z.number().nullable(),
      max: z.number().nullable(),
    })
    .optional(),
  limit: z.number().int().positive().optional(),
  offset: z.number().int().nonnegative().optional(),
});

export const AIParseRequestSchema = z.object({
  query: z.string().min(1),
});

export type ParseResult = z.infer<typeof ParseResultSchema>;
export type SearchRequest = z.infer<typeof SearchRequestSchema>;
export type AIParseRequest = z.infer<typeof AIParseRequestSchema>;
