import { z } from 'zod';

/**
 * Centralised Zod schemas. Used by react-hook-form on the frontend
 * AND mirrored as Pydantic schemas on the backend for full-stack
 * validation parity.
 */

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const incidentCreateSchema = z.object({
  subject: z.string().min(5, 'Subject must be at least 5 characters').max(200),
  description: z.string().min(10, 'Please provide more detail').max(5000),
  caller: z.string().min(2, 'Caller name is required').max(100),
  callerEmail: z.string().email().optional().or(z.literal('')),
  source: z.enum(['itsm', 'monitoring', 'user_chat', 'email', 'webhook']).optional(),
  category: z.string().optional(),
  priority: z.enum(['P1', 'P2', 'P3', 'P4']).optional(),
});

export const runbookSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().min(10).max(1000),
  category: z.string().min(1),
  steps: z
    .array(
      z.object({
        order: z.number().int().min(1),
        title: z.string().min(1),
        command: z.string().optional(),
        expectedOutput: z.string().optional(),
        rollback: z.string().optional(),
      }),
    )
    .min(1, 'At least one step is required'),
  triggers: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
});

export const kbArticleSchema = z.object({
  title: z.string().min(5).max(200),
  content: z.string().min(20),
  summary: z.string().min(10).max(500),
  tags: z.array(z.string()).default([]),
  category: z.string().min(1),
  isPublished: z.boolean().default(false),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type IncidentCreateInput = z.infer<typeof incidentCreateSchema>;
export type RunbookInput = z.infer<typeof runbookSchema>;
export type KBArticleInput = z.infer<typeof kbArticleSchema>;
