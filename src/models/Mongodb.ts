import { z } from 'zod';

export const ObjectIdSchema = z
  .object({
    $oid: z.string(),
  })
  .transform((x) => x.$oid);

export const InsertOneResultSchema = z.object({
  insertedId: ObjectIdSchema,
});

export const UpdateResultSchema = z.object({
  matchedCount: z.number(),
  modifiedCount: z.number(),
  upsertedId: z.any(),
});

export const DeleteResultSchema = z.object({
  deletedCount: z.number(),
});

export const DateTimeSchema = z
  .object({
    $date: z.object({
      $numberLong: z.string(),
    }),
  })
  .transform((dateTime) => new Date(parseInt(dateTime.$date.$numberLong)));
