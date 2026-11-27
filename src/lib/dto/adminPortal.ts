import { z } from 'zod';

export const AdminUserSchema = z.object({
  _id: z.string(),
  email: z.string().email(),
  role: z.literal('admin'),
  name: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type AdminUser = z.infer<typeof AdminUserSchema>;

export const AdminLoginResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    user: AdminUserSchema,
    token: z.string().min(1),
  }),
  message: z.string(),
});

export const AdminMeResponseSchema = z.object({
  success: z.literal(true),
  data: AdminUserSchema,
  message: z.string(),
});

export const DatewiseViewPointSchema = z.object({
  analyticsDate: z.string(),
  siteViews: z.number(),
  jobPageViews: z.number(),
  reviewPageViews: z.number(),
  activeHrCount: z.number(),
});

export const AdminViewsAnalyticsResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    datewiseViews: z.array(DatewiseViewPointSchema),
    websiteViews: z.object({
      siteViews: z.number(),
      jobPageViews: z.number(),
      reviewPageViews: z.number(),
    }),
    totalHrCount: z.number(),
    activeHrCount: z.number(),
  }),
  message: z.string(),
});

export type AdminViewsAnalytics = z.infer<typeof AdminViewsAnalyticsResponseSchema>['data'];

export const AdminPostsCountResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    companyCount: z.number(),
    jobCount: z.number(),
    pendingJobCount: z.number(),
    reviewCount: z.number(),
    pendingReviewCount: z.number(),
  }),
  message: z.string(),
});

export type AdminPostsCount = z.infer<typeof AdminPostsCountResponseSchema>['data'];

export const ReviewCompanySchema = z.object({
  _id: z.string(),
  companyName: z.string(),
  industry: z.string().optional().default(''),
  employmentCount: z.string().optional().default(''),
  location: z.string().optional().default(''),
  status: z.string().optional(),
  avgRating: z.number().optional().default(0),
  reviewCount: z.number().optional().default(0),
  jobTitles: z.array(z.string()).optional().default([]),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type ReviewCompany = z.infer<typeof ReviewCompanySchema>;

export const ReviewCompaniesListResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(ReviewCompanySchema),
  message: z.string(),
  total: z.number(),
  page: z.union([z.number(), z.string()]).optional(),
  limit: z.union([z.number(), z.string()]).optional(),
});

export const UpdateCompanyPayloadSchema = z.object({
  companyName: z.string().trim().min(1, 'Company name is required'),
  industry: z.string().optional().default(''),
  employmentCount: z.string().optional().default(''),
  location: z.string().optional().default(''),
});

export const TransferCompanyReviewsPayloadSchema = z.object({
  action: z.literal('transfer'),
  data: z.object({
    transferCompanyId: z.string().min(1, 'Target company is required'),
  }),
});

export const ApplicantReviewSchema = z.object({
  _id: z.string(),
  company: z.union([
    z.string(),
    z.object({
      _id: z.string(),
      companyName: z.string().optional(),
    }),
  ]),
  jobTitle: z.string(),
  applicationDate: z.string().optional().default(''),
  noOfInterviews: z.number(),
  noOfDays: z.number(),
  hiringPlatform: z.string(),
  otherHiringPlatform: z.string().optional().default(''),
  title: z.string(),
  description: z.string().optional().default(''),
  rating: z.number().min(1).max(5),
  status: z.string(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type ApplicantReview = z.infer<typeof ApplicantReviewSchema>;

export const ReviewsListResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(ApplicantReviewSchema),
  message: z.string(),
  total: z.number().optional(),
});

export const ReviewModerationActionSchema = z.object({
  action: z.enum(['approve', 'reject', 'set-active', 'set-inactive']),
  data: z.record(z.string(), z.unknown()).optional(),
});
