import { ZodObject, ZodRawShape } from "zod";
import { FlaggedFieldSchema, UseFlaggedSchemaParams, UseFlaggedSchemaReturn } from "../types/schema"
import { detectSchemaType } from "../utils";
import { extractFlaggedSchemaFromYup, transformYupSchemaWithValues } from "../yup/extract-flagged-schema-from-yup"
import { extractFlaggedSchemaFromZod, transformZodSchemaWithValues } from "../zod/extract-flagged-schema-from-zod"
import { AnyObjectSchema } from "yup";
import { useMemo } from "react";



export const useLDFlagSchema = <T extends ZodObject<ZodRawShape> | AnyObjectSchema>(
    {schema, flags, overrideFlags}: UseFlaggedSchemaParams<T>
  ): UseFlaggedSchemaReturn<T> => {

  const updatedFlags = useMemo(()=>({ ...flags, ...(overrideFlags ?? {}) }), [flags, overrideFlags]);
  const schemaType = useMemo(() => detectSchemaType(schema), [schema]);
  const fields: FlaggedFieldSchema[] = useMemo(()=>{
    switch (schemaType) {
      case 'zod':
        return  extractFlaggedSchemaFromZod(schema as ZodObject<ZodRawShape>)
      case 'yup':
        return extractFlaggedSchemaFromYup(schema as AnyObjectSchema)
      default:
        return []; 
    }
  }, [schemaType]);

  const transformedSchema = useMemo(() => {
    switch (schemaType) {
      case 'zod':
        return transformZodSchemaWithValues(schema as ZodObject<ZodRawShape>, updatedFlags);
      case 'yup':
        return transformYupSchemaWithValues(schema as AnyObjectSchema, updatedFlags);
      default:
        return schema;
    }
  }, [schemaType, schema, updatedFlags]);
  

  const value = useMemo(()=> {
    const visibilityMap = Object.fromEntries(
      fields.map(field => [
        field.name,
        field.visibilityFlag ? !!updatedFlags[field.visibilityFlag] : true
      ])
    ) as UseFlaggedSchemaReturn<T>['visibilityMap']
  
    const disabledMap = Object.fromEntries(
      fields.map(field => [
        field.name,
        field.disabledFlag ? !!updatedFlags[field.disabledFlag] : false
      ])
    ) as UseFlaggedSchemaReturn<T>['disabledMap']
  
    const readOnlyMap = Object.fromEntries(
      fields.map(field => [
        field.name,
        field.readonlyFlag ? !!updatedFlags[field.readonlyFlag] : true
      ])
    ) as UseFlaggedSchemaReturn<T>['readOnlyMap']
  
    const requiredMap = Object.fromEntries(
      fields.map(field => [
        field.name,
        field.requiredFlag ? !!updatedFlags[field.requiredFlag] : false
      ])
    ) as UseFlaggedSchemaReturn<T>['requiredMap']

    const defaultValueMap = Object.fromEntries(
      fields.map(field => [
        field.name,
        field.defaultValueFlag ? updatedFlags[field.defaultValueFlag] : undefined
      ])
    ) as UseFlaggedSchemaReturn<T>['defaultValueMap']

    return {
      visibilityMap,
      disabledMap,
      readOnlyMap,
      requiredMap,
      defaultValueMap,
      schema: transformedSchema as T
    }

  }, [fields, updatedFlags, transformedSchema])

  return value
}