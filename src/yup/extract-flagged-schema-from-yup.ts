// src/yup/extractFlaggedSchemaFromYup.ts
import { AnyObjectSchema, object, Schema } from 'yup'
import { FlaggedFieldSchema, Flags } from '../types/schema'
import { isNil } from '../utils';

export function extractFlaggedSchemaFromYup(
  yupSchema: AnyObjectSchema
): FlaggedFieldSchema[] {
  const fields = Object.entries(yupSchema.fields).map(([name, field]) => {
    // Some fields (Reference) do not have .meta, so check before calling
    const meta =
      typeof (field as any).meta === 'function'
        ? (field as any).meta() || {}
        : {};
    return {
      name,
      visibilityFlag: meta.visibilityFlag,
      disabledFlag: meta.disabledFlag,
      readonlyFlag: meta.readonlyFlag,
      requiredFlag: meta.requiredFlag,
      defaultValueFlag: meta.defaultValueFlag,
    } as FlaggedFieldSchema;
  });

  return fields;
}


/**
 * Transforms a base Yup object schema based on metadata and flags.
 */
export function transformYupSchemaWithValues(
  base: AnyObjectSchema,
  flags: Flags
): AnyObjectSchema {
  const newShape = {};
  const fields = (base as any).fields as Record<string, Schema<any>>
  for (const [key, fieldSchema] of Object.entries(fields)) {
    const meta = typeof (fieldSchema as any).meta === 'function'
      ? (fieldSchema as any).meta() || {}
      : {};
    // omit
    if (meta.omitFlag && flags[meta.omitFlag as string]) {
      continue;
    }

    let yupShape = fieldSchema.clone()
    // required vs notRequired
    if (meta.requiredFlag && !isNil(flags[meta.requiredFlag as string]) && 'required' in yupShape) {
      yupShape = flags[meta.requiredFlag] ? yupShape.required() : yupShape.notRequired()
    }
    // min
    if (meta.minValueFlag && !isNil(flags[meta.minValueFlag as string]) && 'min' in yupShape) {
      yupShape = (yupShape as any).min(flags[meta.minValueFlag as string])
    }
    // max
    if (meta.maxValueFlag && !isNil(flags[meta.maxValueFlag as string]) && 'max' in yupShape) {
      yupShape = (yupShape as any).max(flags[meta.maxValueFlag as string])
    }
    // enum override (oneOf)
    if (meta.enumValuesFlag && Array.isArray(flags[meta.enumValuesFlag as string]) && 'oneOf' in yupShape) {
      yupShape = (yupShape as any).oneOf(flags[meta.enumValuesFlag as string])
    }
    // default override
    if (meta.defaultValueFlag && !isNil(flags[meta.defaultValueFlag as string]) && 'default' in yupShape) {
      yupShape = (yupShape as any).default(flags[meta.defaultValueFlag as string])
    }
    // Create a new object to avoid mutating the readonly index signature
    Object.assign(newShape, { [key]: yupShape });
  }

  return object().shape(newShape);
}