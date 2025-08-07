import { AnyObjectSchema } from "yup"
import { ZodObject, ZodRawShape } from "zod"

export interface FlaggedFieldSchema {
  name: string
  visibilityFlag?: string // controls visibility
  disabledFlag?: string // controls disabled state
  readonlyFlag?: string // controls readonly state
  requiredFlag?: string // controls required state
  omitFlag?: string // controls if the field should be omitted
  minValueFlag?: string // controls min value
  maxValueFlag?: string // controls max value
  enumValuesFlag?: string // controls enum values
  defaultValueFlag?: string // controls default value
}

export type SchemaType = 'zod' | 'yup'

export type FlagValue = boolean | number | Date | string | undefined | null | Array<unknown>
export type Flags = Record<string, FlagValue>

export type UseFlaggedSchemaParams<T extends ZodObject<ZodRawShape> | AnyObjectSchema = ZodObject<ZodRawShape> | AnyObjectSchema> = {
    schema: T,
    flags: Flags,
    overrideFlags?: Flags
}

// Extract schema keys type helper
export type SchemaKeys<T> = T extends ZodObject<infer R> 
  ? keyof R 
  : T extends AnyObjectSchema 
    ? T extends { fields: infer F } 
      ? keyof F 
      : string
    : string

// Return type for the hook with proper key typing
export type UseFlaggedSchemaReturn<T extends ZodObject<ZodRawShape> | AnyObjectSchema> = {
  visibilityMap: Record<SchemaKeys<T>, boolean>
  disabledMap: Record<SchemaKeys<T>, boolean>
  readOnlyMap: Record<SchemaKeys<T>, boolean>
  requiredMap: Record<SchemaKeys<T>, boolean>
  defaultValueMap: Record<SchemaKeys<T>, any>
  schema: T
}
