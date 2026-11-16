import { z } from 'zod';

export const HrSocialLinkSchema = z.object({
  name: z.string(),
  link: z.string(),
});

export const HrUserSchema = z.object({
  _id: z.string(),
  email: z.string().email(),
  role: z.literal('hr'),
  name: z.string(),
  companyName: z.string().optional().default(''),
  industry: z.string().optional().default(''),
  employmentCount: z.string().optional().default(''),
  location: z.string().optional().default(''),
  jobCount: z.number().int().nonnegative().default(0),
  isHrActiveToday: z.boolean().default(false),
  socialLinks: z.array(HrSocialLinkSchema).optional().default([]),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  __v: z.number().optional(),
});

export const HrLoginResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    user: HrUserSchema,
    token: z.string().min(1),
  }),
  message: z.string(),
});

export const HrUserDetailsResponseSchema = z.object({
  success: z.literal(true),
  data: HrUserSchema,
  message: z.string(),
});

export type HrUser = z.infer<typeof HrUserSchema>;
export type HrLoginResponse = z.infer<typeof HrLoginResponseSchema>;
export type HrUserDetailsResponse = z.infer<typeof HrUserDetailsResponseSchema>;
