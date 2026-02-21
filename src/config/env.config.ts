import { z } from 'zod';

export const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  DATABASE_URL: z.string().min(1),
  ACCESS_TOKEN_SECRET: z.string().min(1),
  REFRESH_TOKEN_SECRET: z.string().min(1),
  REDIS_URL: z.string().min(1),
  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.coerce.number().min(1),
  SMTP_USER: z.string().min(1),
  SMTP_PASS: z.string().min(1),
});

export type EnvConfig = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>) {
  const result = envSchema.safeParse(config);
  if (!result.success) {
    throw new Error(
      `Environment variables validation failed: ${result.error.message}`,
    );
  }
  return result.data;
}
