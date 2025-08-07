import { ZodObject, ZodRawShape } from "zod";
import { FlaggedFieldSchema, UseFlaggedSchemaParams } from "../types/schema"
import { detectSchemaType } from "../utils";
import { extractFlaggedSchemaFromYup, transformYupSchemaWithValues } from "../yup/extract-flagged-schema-from-yup"
import { extractFlaggedSchemaFromZod, transformZodSchemaWithValues } from "../zod/extract-flagged-schema-from-zod"
import { AnyObjectSchema } from "yup";
import { useMemo } from "react";



export const useLDFlagSchema = (
    {schema, flags, overrideFlags}: UseFlaggedSchemaParams
  ) => {

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
    )
  
    const disabledMap = Object.fromEntries(
      fields.map(field => [
        field.name,
        field.disabledFlag ? !updatedFlags[field.disabledFlag] : false
      ])
    )
  
    const readOnlyMap = Object.fromEntries(
      fields.map(field => [
        field.name,
        field.readonlyFlag ? !!updatedFlags[field.readonlyFlag] : true
      ])
    )
  
    const requiredMap = Object.fromEntries(
      fields.map(field => [
        field.name,
        field.requiredFlag ? !updatedFlags[field.requiredFlag] : false
      ])
    )

    return {
      visibilityMap,
      disabledMap,
      readOnlyMap,
      requiredMap,
      schema: transformedSchema
    }

  }, [fields, updatedFlags])

  return value
}