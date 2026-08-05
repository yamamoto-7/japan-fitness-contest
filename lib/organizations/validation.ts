import { z } from "zod";

export const organizationInputSchema = z
  .object({
    name: z.string().trim().min(1, "団体名は必須です。").max(100),
  })
  .strict();

export const organizationPatchSchema = organizationInputSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, "更新項目を指定してください。");

export const organizationIdSchema = z.string().uuid();

export type OrganizationInput = z.infer<typeof organizationInputSchema>;
