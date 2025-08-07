// src/zod/extractFlaggedSchemaFromZod.ts
import z, { ZodObject, ZodRawShape, ZodTypeAny } from 'zod'
import { FlaggedFieldSchema, Flags, FlagValue } from '../types/schema'
import { isNil } from '../utils'

export function extractFlaggedSchemaFromZod<T extends ZodRawShape>(
  zodSchema: ZodObject<T>
): FlaggedFieldSchema[] {
  const fields = Object.entries(zodSchema.shape).map(([name, schema]) => {
    const meta = (schema as z.ZodTypeAny).meta() || {}
    return {
      name,
      visibilityFlag: meta.flag,
      disabledFlag: meta.disabledFlag,
      readonlyFlag: meta.readonlyFlag,
      requiredFlag: meta.requiredFlag,
      minValue: meta.minValue,
      maxValue: meta.maxValue,
      enumValues: meta.enumValues,
      defaultValue: meta.defaultValue
    } as FlaggedFieldSchema;
  });

  return fields
}





export function transformZodSchemaWithValues<T extends ZodRawShape>(
  base: ZodObject<T>,
  flags: Flags
): ZodObject<T> {
  const newShape: ZodRawShape = {};
  for (const [key, fieldSchema] of Object.entries(base.shape)) {
    const meta = (fieldSchema as ZodTypeAny).meta?.() || {}
    // omit
    if (meta.omitFlag && !flags[meta.omitFlag as string]) {
      continue;
    }
    let zodShape = fieldSchema;
    // required/optional
    if (meta.requiredFlag) {
      if (!flags[meta.requiredFlag as string] && typeof (zodShape as any).optional === 'function') {
        zodShape = (zodShape as any).optional();
      }
    }
    // min
    if (!isNil(meta.minValue) && typeof (zodShape as any).min === 'function') {
      zodShape = (zodShape as any).min(meta.minValue);
    }
    // max
    if (!isNil(meta.maxValue) && 'max' in zodShape) {
      zodShape = (zodShape as any).max(meta.maxValue);
    }
    // enum override
    if (Array.isArray(meta.enumValues)) {
      zodShape = z.enum(meta.enumValues);
    }
    // default override
    if (!isNil(meta.defaultValue)) {
      if (typeof (zodShape as any).default === 'function') {
        zodShape = (zodShape as any).default(meta.defaultValue);
      }
    }
    // Create a new object to avoid mutating the readonly index signature
    Object.assign(newShape, { [key]: zodShape });
  }
  // Cast newShape to ZodRawShape and then to T to satisfy the type constraint
  return z.object(newShape  as T);
}