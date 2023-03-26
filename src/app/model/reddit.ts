import { z } from 'zod'

export type Link = z.infer<typeof linkSchema>
export const linkSchema = z.object({
  kind: z.literal('t3'),
  data: z.object({
    // label (e.g. '❔ Question' or '🔊 New Release')
    link_flair_text: z.string().optional(),
    title: z.string(),
    selftext: z.string().optional(),
    ups: z.number(),
    downs: z.number(),
    // reddit's id for things (referred to as fullname)
    name: z.string(),
    url: z.string(),
  }),
})

export type Listing = z.infer<typeof listingSchema>
export const listingSchema = z.object({
  kind: z.literal('Listing'),
  data: z.object({
    before: z.string().nullable(),
    after: z.string().nullable(),
    // distinct number of children
    dist: z.number(),
    children: z.array(z.union([linkSchema, linkSchema])),
  }),
})
