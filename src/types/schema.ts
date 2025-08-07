import { AnyObjectSchema } from "yup"
import { ZodObject, ZodRawShape } from "zod"

export interface FlaggedFieldSchema {
  name: string
  visibilityFlag?: string // controls visibility
  disabledFlag?: string // controls disabled state
  readonlyFlag?: string // controls readonly state
  requiredFlag?: string // controls required state
  minValue?: number // controls min value
  maxValue?: number // controls max value
  enumValues?: Array<string | number | boolean | Date | string | undefined | null> // controls enum values
  defaultValue?: FlagValue // controls default value
}

export type SchemaType = 'zod' | 'yup'

export type FlagValue = boolean | number | Date | string | undefined | null | Array<unknown>
export type Flags = Record<string, FlagValue>

export type UseFlaggedSchemaParams = {
    schema: ZodObject<ZodRawShape> | AnyObjectSchema,
    flags: Flags,
    overrideFlags?: Record<string, boolean>
}
