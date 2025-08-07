import z from "zod"
import { SchemaType } from "../types/schema"

export const detectSchemaType = (schema: unknown): SchemaType | undefined => {
    if (schema instanceof z.ZodObject) return 'zod'
    if (schema && typeof schema === 'object' && 'describe' in schema && 'fields' in (schema as any)) {
      return 'yup'
    }
  }

export const isNil = (value: unknown): boolean => {
  return value === null || value === undefined
}