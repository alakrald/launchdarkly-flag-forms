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
      omitFlag: meta.omitFlag,
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
      yupShape = flags[meta.requiredFlag as string] ? yupShape.required() : yupShape.notRequired()
    }
    // Create a new object to avoid mutating the readonly index signature
    Object.assign(newShape, { [key]: yupShape });
  }

  return object().shape(newShape);
}