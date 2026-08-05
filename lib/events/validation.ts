import { z } from "zod";

const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "日付はYYYY-MM-DD形式で入力してください。")
  .refine((value) => {
    const date = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
  }, "有効な日付を入力してください。");

const nullableText = (max: number) =>
  z.preprocess(
    (value) => (value === "" ? null : value),
    z.string().trim().max(max).nullable(),
  );

const eventFieldsSchema = z
  .object({
    name: z.string().trim().min(1, "大会名は必須です。").max(200),
    organizationId: z.string().uuid("登録済みの団体を選択してください。"),
    startDate: isoDateSchema,
    endDate: isoDateSchema,
    location: z.string().trim().min(1, "開催地は必須です。").max(255),
    officialUrl: z.preprocess(
      (value) => (value === "" ? null : value),
      z
        .string()
        .trim()
        .url("有効なURLを入力してください。")
        .refine((value) => /^https?:\/\//.test(value), "URLはhttpまたはhttpsで入力してください。")
        .nullable(),
    ),
    description: nullableText(10000),
    isPublished: z.boolean().default(false),
  })
  .strict();

export const eventInputSchema = eventFieldsSchema.refine(
  (value) => value.endDate >= value.startDate,
  {
    path: ["endDate"],
    message: "終了日は開始日以降にしてください。",
  },
);

export const eventPatchSchema = eventFieldsSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, "更新項目を指定してください。");

export const adminEventQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  published: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.enum(["true", "false"]).optional(),
  ),
  q: z.string().trim().max(200).optional(),
});

export const eventIdSchema = z.string().uuid();

export type EventInput = z.infer<typeof eventInputSchema>;
