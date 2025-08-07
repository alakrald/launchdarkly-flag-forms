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

export type UseFlaggedSchemaParams = {
    schema: ZodObject<ZodRawShape> | AnyObjectSchema,
    flags: Flags,
    overrideFlags?: Record<string, boolean>
}
