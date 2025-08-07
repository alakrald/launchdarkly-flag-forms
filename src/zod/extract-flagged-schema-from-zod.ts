// src/zod/extractFlaggedSchemaFromZod.ts
import z, { ZodObject, ZodRawShape, ZodTypeAny } from 'zod'
import { FlaggedFieldSchema, Flags, FlagValue } from '../types/schema'
import { isNil } from '../utils'

export function extractFlaggedSchemaFromZod<T extends ZodRawShape>(
  zodSchema: ZodObject<T>
): FlaggedFieldSchema[] {
  const fields = Object.entries(zodSchema.shape).map(([name, schema]) => {
    const meta = (schema as z.ZodTypeAny)?.meta?.() || {}
    return {
      name,
      visibilityFlag: meta.visibilityFlag,
      disabledFlag: meta.disabledFlag,
      readonlyFlag: meta.readonlyFlag,
      requiredFlag: meta.requiredFlag,
      defaultValueFlag: meta.defaultValueFlag,
    } as FlaggedFieldSchema;
  });

  return fields
}





export function transformZodSchemaWithValues<T extends ZodRawShape>(
  base: ZodObject<T>,
  flags: Flags
): ZodObject<T> {
  const newShape = {};
  for (const [key, fieldSchema] of Object.entries(base.shape)) {
    const meta: any = (fieldSchema as ZodTypeAny)?.meta?.() || {}
    // omit
    if (meta.omitFlag && flags[meta.omitFlag as string]) {
      continue;
    }
    let zodShape = fieldSchema;
    // required/optional
    if (meta.requiredFlag && !isNil(flags[meta.requiredFlag as string]) && 'optional' in zodShape) {
      if (!flags[meta.requiredFlag as string]) {
        zodShape = (zodShape as any).optional();
      }
    }
    // default override
    if (meta.defaultValueFlag && !isNil(flags[meta.defaultValueFlag as string]) && 'default' in zodShape) {
        zodShape = (zodShape as any).default(flags[meta.defaultValueFlag as string]);
    }
    // Create a new object to avoid mutating the readonly index signature
    Object.assign(newShape, { [key]: zodShape });
  }
  // Cast newShape to ZodRawShape and then to T to satisfy the type constraint
  return z.object(newShape  as T);
}