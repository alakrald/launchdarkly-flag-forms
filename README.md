# 🏁 launchdarkly-flag-form

A powerful React hook library for dynamic form control using feature flags. Transform your forms with real-time field visibility, validation, and behavior based on feature flag values.

## ✨ Features

- 🚀 **React Hook-based**: Simple `useLDFlagSchema` hook for seamless integration
- 🔄 **Dynamic Schema Transformation**: Real-time schema modification based on flag values
- 🛡️ **Type-safe**: Full TypeScript support with Zod and Yup schemas
- ⚡ **Multiple Control Types**: Visibility, disabled state, readonly, omit, dynamic defaults
- 🎯 **Framework Agnostic**: Works with any form library (React Hook Form, TanStack Form, etc.)
- 🔧 **Schema Support**: Native Zod and Yup integration with automatic detection
- 📦 **Lightweight**: Minimal bundle size with tree-shaking support
- 🚫 **Zero Dependencies**: No LaunchDarkly SDK required - bring your own flags
- 🎨 **Dynamic Defaults**: Control default values through feature flags

---

## 📦 Installation

```bash
npm install launchdarkly-flag-form
# or
yarn add launchdarkly-flag-form
# or
pnpm add launchdarkly-flag-form
```

### Dependencies

```bash
# Required
npm install react react-dom

# Choose your schema library (install at least one)
npm install zod        # For Zod schemas
npm install yup        # For Yup schemas

# Or install both if you want to use both
npm install zod yup
```

---

## 🚀 Quick Start

### Basic Example with Zod

```tsx
import React from "react";
import { z } from "zod";
import { useLDFlagSchema } from "launchdarkly-flag-form";

// Define schema with flag metadata
const userSchema = z.object({
  firstName: z.string().min(1, "Required"),

  lastName: z.string().min(1, "Required").meta({
    flag: "show-last-name", // Visibility flag
    label: "Last Name",
  }),

  email: z.string().email().meta({
    disabledFlag: "disable-email", // Disabled state flag
    label: "Email Address",
  }),

  phone: z.string().optional().meta({
    flag: "show-phone",
    readonlyFlag: "readonly-phone", // Readonly state flag
    label: "Phone Number",
  }),
});

function UserForm() {
  // Your feature flags from any source
  const flags = {
    "show-last-name": true,
    "disable-email": false,
    "show-phone": true,
    "readonly-phone": false,
  };

  const {
    visibilityMap,
    disabledMap,
    readOnlyMap,
    schema: transformedSchema,
  } = useLDFlagSchema({
    schema: userSchema,
    flags,
  });

  return (
    <form>
      {/* First name - always visible */}
      <input
        name="firstName"
        placeholder="First Name"
        // validation handled by schema
      />

      {/* Last name - controlled by flag */}
      {visibilityMap.lastName && (
        <input
          name="lastName"
          placeholder="Last Name"
          disabled={disabledMap.lastName}
          readOnly={readOnlyMap.lastName}
          // validation handled by schema
        />
      )}

      {/* Email - can be disabled by flag */}
      <input
        name="email"
        type="email"
        placeholder="Email"
        disabled={disabledMap.email}
        readOnly={readOnlyMap.email}
        // validation handled by schema
      />

      {/* Phone - multiple flag controls */}
      {visibilityMap.phone && (
        <input
          name="phone"
          placeholder="Phone"
          disabled={disabledMap.phone}
          readOnly={readOnlyMap.phone}
          // validation handled by schema
        />
      )}
    </form>
  );
}
```

### Basic Example with Yup

```tsx
import * as yup from "yup";
import { useLDFlagSchema } from "launchdarkly-flag-form";

const userSchema = yup.object({
  firstName: yup.string().required("Required"),

  lastName: yup.string().required("Required").meta({
    flag: "show-last-name",
    label: "Last Name",
  }),

  email: yup.string().email().required().meta({
    disabledFlag: "disable-email",
    label: "Email Address",
  }),
});

// Usage is identical to Zod example
const { visibilityMap, disabledMap, schema } = useLDFlagSchema({
  schema: userSchema,
  flags: yourFlags,
});
```

---

## 🔧 Advanced Features

### Dynamic Schema Transformation

The library can dynamically transform your schema based on flag values:

```tsx
const dynamicSchema = z.object({
  username: z.string().min(3),

  role: z.enum(["user", "admin"]).meta({
    flag: "show-role",
  }),

  theme: z.string().meta({
    defaultValueFlag: "default-theme", // Dynamic default value from flag
    omitFlag: "hide-theme",
  }),
});

const flags = {
  "show-role": true,
  "hide-theme": false,
  "default-theme": "dark", // This becomes the default value
};

const { schema: transformedSchema, defaultValueMap } = useLDFlagSchema({
  schema: dynamicSchema,
  flags,
});

// transformedSchema is now modified based on flag values
// - role visibility controlled by flag
// - theme defaults to 'dark' (from flag value)

// defaultValueMap provides easy access to dynamic defaults
console.log(defaultValueMap.theme); // "dark"
console.log(defaultValueMap.username); // undefined (no defaultValueFlag)
```

> **🚀 Coming Soon**: Validation-based flags such as minLength, maxLength, minValue, maxValue, and required toggling; dynamic enum options; and more schema transformations.

### Override Flags

Provide temporary flag overrides without modifying your main flags object:

```tsx
const { visibilityMap } = useLDFlagSchema({
  schema: userSchema,
  flags: globalFlags,
  overrideFlags: {
    "show-advanced-fields": true, // Temporary override
    "disable-editing": false, // Override for development
  },
});
```

### React Hook Form Integration

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLDFlagSchema } from "launchdarkly-flag-form";

function UserFormWithValidation() {
  const flags = { "show-last-name": true, "disable-email": false };

  const {
    visibilityMap,
    disabledMap,
    schema: transformedSchema,
  } = useLDFlagSchema({
    schema: userSchema,
    flags,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(transformedSchema as typeof userSchema),
  });

  const onSubmit = (data) => {
    console.log("Form data:", data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {visibilityMap.firstName && (
        <div>
          <input
            {...register("firstName")}
            disabled={disabledMap.firstName}
            placeholder="First Name"
          />
          {errors.firstName && <span>{errors.firstName.message}</span>}
        </div>
      )}

      {visibilityMap.lastName && (
        <div>
          <input
            {...register("lastName")}
            disabled={disabledMap.lastName}
            placeholder="Last Name"
          />
          {errors.lastName && <span>{errors.lastName.message}</span>}
        </div>
      )}

      <button type="submit">Submit</button>
    </form>
  );
}
```

---

## 📖 API Reference

### `useLDFlagSchema(params)`

The main hook for dynamic form control.

**Parameters:**

```typescript
interface UseFlaggedSchemaParams {
  schema: ZodObject<ZodRawShape> | AnyObjectSchema; // Zod or Yup schema
  flags: Record<string, FlagValue>; // Your feature flags
  overrideFlags?: Record<string, boolean>; // Optional flag overrides
}

type FlagValue =
  | boolean
  | number
  | Date
  | string
  | undefined
  | null
  | Array<unknown>;
```

**Returns:**

```typescript
{
  visibilityMap: Record<SchemaKeys<T>, boolean>; // Field visibility states
  disabledMap: Record<SchemaKeys<T>, boolean>; // Field disabled states
  readOnlyMap: Record<SchemaKeys<T>, boolean>; // Field readonly states
  defaultValueMap: Record<SchemaKeys<T>, any>; // Dynamic default values
  schema: T; // Dynamically modified schema
}
```

Where `SchemaKeys<T>` extracts the actual field names from your schema for full type safety.

**Type Safety Benefits:**

```typescript
const userSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
});

const { visibilityMap, defaultValueMap } = useLDFlagSchema({
  schema: userSchema,
  flags: {},
});

// ✅ TypeScript knows these exist
visibilityMap.firstName; // boolean
visibilityMap.lastName; // boolean
visibilityMap.email; // boolean

defaultValueMap.firstName; // any (dynamic default value)
defaultValueMap.lastName; // any
defaultValueMap.email; // any

// ❌ TypeScript error - property doesn't exist
visibilityMap.invalidField; // Error: Property 'invalidField' does not exist
defaultValueMap.invalidField; // Error: Property 'invalidField' does not exist
```

**Resolver Type Safety:**

When using with form libraries, you can provide explicit typing to avoid type checking:

```typescript
import { useLDFlagSchema } from "launchdarkly-flag-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Define your schema
const userSchema = z.object({
  firstName: z.string(),
  email: z.string(),
});

const { schema: transformedSchema } = useLDFlagSchema({
  schema: userSchema,
  flags,
});

// ✅ Simple type assertion - TypeScript knows it's a Zod schema
const resolver = zodResolver(transformedSchema as typeof userSchema);

// Or for Yup:
// const resolver = yupResolver(transformedSchema as typeof userYupSchema);
```

## 🏗️ Supported Flag Types

The library supports six different types of flags to control various aspects of your form fields:

### **1. `visibilityFlag` (Visibility Control)**

Controls whether a field is visible in the form.

```typescript
const schema = z.object({
  lastName: z.string().meta({
    visibilityFlag: "show-last-name", // Field visible when flag is true
  }),
});

const flags = { "show-last-name": true };
const { visibilityMap } = useLDFlagSchema({ schema, flags });

// Usage
{
  visibilityMap.lastName && <input name="lastName" />;
}
```

### **2. `disabledFlag` (Interaction Control)**

Controls whether a field is disabled (non-interactive).

```typescript
const schema = z.object({
  email: z.string().meta({
    disabledFlag: "disable-email-editing",
  }),
});

const flags = { "disable-email-editing": false }; // false = enabled
const { disabledMap } = useLDFlagSchema({ schema, flags });

// Usage
<input name="email" disabled={disabledMap.email} />;
```

### **3. `readonlyFlag` (Edit Control)**

Controls whether a field is readonly (visible but not editable).

```typescript
const schema = z.object({
  userId: z.string().meta({
    readonlyFlag: "readonly-user-id",
  }),
});

const flags = { "readonly-user-id": true }; // true = readonly
const { readOnlyMap } = useLDFlagSchema({ schema, flags });

// Usage
<input name="userId" readOnly={readOnlyMap.userId} />;
```

### ⚠️ Validation Flags

Validation-based flags (e.g., toggling required, minLength, maxLength, minValue, maxValue) are currently not supported. These are planned as part of an upcoming release focused on validation controls.

### **5. `omitFlag` (Schema Control)**

Controls whether a field is completely omitted from the schema.

```typescript
const schema = z.object({
  debugInfo: z.string().meta({
    omitFlag: "include-debug-fields",
  }),
});

const flags = { "include-debug-fields": false }; // false = omitted
const { schema: transformedSchema } = useLDFlagSchema({ schema, flags });

// Field is completely removed from validation schema when omitted
```

### **6. `defaultValueFlag` (Default Value Control)**

Controls the default value of a field through flags.

```typescript
const schema = z.object({
  theme: z.string().meta({
    defaultValueFlag: "user-preferred-theme",
  }),
});

const flags = { "user-preferred-theme": "dark" };
const { defaultValueMap } = useLDFlagSchema({ schema, flags });

// Usage
const { register } = useForm({
  defaultValues: {
    theme: defaultValueMap.theme, // "dark"
  },
});
```

### **Combining Multiple Flags**

You can use multiple flags on the same field for complex control:

```typescript
const schema = z.object({
  adminEmail: z.string().email().meta({
    flag: "show-admin-fields", // Visibility control
    disabledFlag: "enable-admin-edit", // Interaction control
    readonlyFlag: "readonly-admin-data", // Edit control
    // Validation flags are currently not supported
    defaultValueFlag: "admin-default-email", // Default value control
  }),
});

const flags = {
  "show-admin-fields": true, // Show the field
  "enable-admin-edit": true, // Field is enabled (not disabled)
  "readonly-admin-data": false, // Field is editable (not readonly)
  "admin-default-email": "admin@company.com", // Default value
};

const {
  visibilityMap,
  disabledMap,
  readOnlyMap,
  requiredMap,
  defaultValueMap,
} = useLDFlagSchema({ schema, flags });

// Result:
// - Field is visible: visibilityMap.adminEmail = true
// - Field is enabled: disabledMap.adminEmail = false
// - Field is editable: readOnlyMap.adminEmail = false
// - Field is required: requiredMap.adminEmail = true
// - Default value: defaultValueMap.adminEmail = "admin@company.com"
```

### Meta Properties

Define flag control in your schema using the `.meta()` method:

```typescript
interface FieldMeta {
  // Control flags
  flag?: string; // Controls field visibility
  disabledFlag?: string; // Controls disabled state
  readonlyFlag?: string; // Controls readonly state
  requiredFlag?: string; // Controls required validation
  omitFlag?: string; // Omits field from schema entirely

  // Dynamic values
  defaultValue?: any; // Static default value
  defaultValueFlag?: string; // Flag to control dynamic default value

  // Display properties
  label?: string; // Field label
}
```

---

## 📚 Framework Integration Examples

### React Hook Form + Zod

Complete example with form validation and flag-controlled fields:

```tsx
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLDFlagSchema } from "launchdarkly-flag-form";

// Define schema with comprehensive flag controls
const userRegistrationSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),

  lastName: z.string().min(2, "Last name must be at least 2 characters").meta({
    flag: "show-last-name",
    label: "Last Name",
  }),

  email: z.string().email("Invalid email address").meta({
    disabledFlag: "disable-email-editing",
    label: "Email Address",
  }),

  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number")
    .optional()
    .meta({
      flag: "show-phone-field",
      readonlyFlag: "readonly-phone",
      label: "Phone Number",
    }),

  role: z.enum(["Developer", "Designer", "Manager", "Other"]).meta({
    flag: "show-role-field",
    enumValues: ["Developer", "Designer", "Manager", "Other", "Intern"], // Dynamic options
    label: "Role",
  }),

  newsletter: z.boolean().optional().meta({
    flag: "show-newsletter-opt-in",
    defaultValue: true,
    label: "Subscribe to Newsletter",
  }),
});

function ReactHookFormZodExample() {
  const flags = {
    "show-last-name": true,
    "disable-email-editing": false,
    "show-phone-field": true,
    "readonly-phone": false,
    "show-role-field": true,
    "show-newsletter-opt-in": true,
  };

  const {
    visibilityMap,
    disabledMap,
    readOnlyMap,
    defaultValueMap,
    schema: transformedSchema,
  } = useLDFlagSchema({
    schema: userRegistrationSchema,
    flags,
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm({
    resolver: zodResolver(transformedSchema as typeof userRegistrationSchema),
    defaultValues: {
      newsletter: defaultValueMap.newsletter ?? false, // Use dynamic default
    },
    mode: "onBlur",
  });

  const onSubmit = async (data) => {
    console.log("Form submitted:", data);
    // Handle form submission
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* First Name - Always visible */}
      <div>
        <label htmlFor="firstName" className="block text-sm font-medium">
          First Name *
        </label>
        <input
          id="firstName"
          {...register("firstName")}
          type="text"
          className="mt-1 block w-full rounded-md border-gray-300"
          placeholder="Enter first name"
        />
        {errors.firstName && (
          <p className="mt-1 text-sm text-red-600">
            {errors.firstName.message}
          </p>
        )}
      </div>

      {/* Last Name - Flag controlled visibility */}
      {visibilityMap.lastName && (
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium">
            Last Name *
          </label>
          <input
            id="lastName"
            {...register("lastName")}
            type="text"
            disabled={disabledMap.lastName}
            readOnly={readOnlyMap.lastName}
            className="mt-1 block w-full rounded-md border-gray-300"
            placeholder="Enter last name"
          />
          {errors.lastName && (
            <p className="mt-1 text-sm text-red-600">
              {errors.lastName.message}
            </p>
          )}
        </div>
      )}

      {/* Email - Can be disabled */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          Email *
        </label>
        <input
          id="email"
          {...register("email")}
          type="email"
          disabled={disabledMap.email}
          readOnly={readOnlyMap.email}
          className="mt-1 block w-full rounded-md border-gray-300"
          placeholder="Enter email address"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      {/* Phone - Multiple controls */}
      {visibilityMap.phone && (
        <div>
          <label htmlFor="phone" className="block text-sm font-medium">
            Phone Number
          </label>
          <input
            id="phone"
            {...register("phone")}
            type="tel"
            disabled={disabledMap.phone}
            readOnly={readOnlyMap.phone}
            className="mt-1 block w-full rounded-md border-gray-300"
            placeholder="+1234567890"
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
          )}
        </div>
      )}

      {/* Role - Dynamic enum values */}
      {visibilityMap.role && (
        <div>
          <label htmlFor="role" className="block text-sm font-medium">
            Role *
          </label>
          <select
            id="role"
            {...register("role")}
            disabled={disabledMap.role}
            className="mt-1 block w-full rounded-md border-gray-300"
          >
            <option value="">Select role</option>
            <option value="Developer">Developer</option>
            <option value="Designer">Designer</option>
            <option value="Manager">Manager</option>
            <option value="Other">Other</option>
            <option value="Intern">Intern</option>
          </select>
          {errors.role && (
            <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
          )}
        </div>
      )}

      {/* Newsletter - Checkbox */}
      {visibilityMap.newsletter && (
        <div className="flex items-center">
          <input
            id="newsletter"
            {...register("newsletter")}
            type="checkbox"
            disabled={disabledMap.newsletter}
            className="mr-2"
          />
          <label htmlFor="newsletter" className="text-sm">
            Subscribe to Newsletter
          </label>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {isSubmitting ? "Submitting..." : "Register"}
      </button>
    </form>
  );
}
```

### React Hook Form + Yup

Same functionality using Yup validation:

```tsx
import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useLDFlagSchema } from "launchdarkly-flag-form";

// Define Yup schema with flag metadata
const userRegistrationSchema = yup.object({
  firstName: yup
    .string()
    .min(2, "First name must be at least 2 characters")
    .required(),

  lastName: yup
    .string()
    .min(2, "Last name must be at least 2 characters")
    .required()
    .meta({
      flag: "show-last-name",
      label: "Last Name",
    }),

  email: yup.string().email("Invalid email address").required().meta({
    disabledFlag: "disable-email-editing",
    label: "Email Address",
  }),

  phone: yup
    .string()
    .matches(/^\+?[1-9]\d{1,14}$/, "Invalid phone number")
    .meta({
      flag: "show-phone-field",
      readonlyFlag: "readonly-phone",
      label: "Phone Number",
    }),

  role: yup
    .string()
    .oneOf(["Developer", "Designer", "Manager", "Other"])
    .required()
    .meta({
      flag: "show-role-field",
      enumValues: ["Developer", "Designer", "Manager", "Other", "Intern"],
      label: "Role",
    }),

  newsletter: yup.boolean().meta({
    flag: "show-newsletter-opt-in",
    defaultValue: true,
    label: "Subscribe to Newsletter",
  }),
});

function ReactHookFormYupExample() {
  const flags = {
    "show-last-name": true,
    "disable-email-editing": false,
    "show-phone-field": true,
    "readonly-phone": false,
    "show-role-field": true,
    "show-newsletter-opt-in": true,
  };

  const {
    visibilityMap,
    disabledMap,
    readOnlyMap,
    schema: transformedSchema,
  } = useLDFlagSchema({
    schema: userRegistrationSchema,
    flags,
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(transformedSchema as typeof userRegistrationSchema),
    mode: "onBlur",
  });

  const onSubmit = async (data) => {
    console.log("Form submitted:", data);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  // Form JSX is identical to Zod example - showing condensed version
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* First Name */}
      <div>
        <label>First Name *</label>
        <input {...register("firstName")} placeholder="Enter first name" />
        {errors.firstName && (
          <p className="error">{errors.firstName.message}</p>
        )}
      </div>

      {/* Last Name - Flag controlled */}
      {visibilityMap.lastName && (
        <div>
          <label>Last Name *</label>
          <input
            {...register("lastName")}
            disabled={disabledMap.lastName}
            readOnly={readOnlyMap.lastName}
            placeholder="Enter last name"
          />
          {errors.lastName && (
            <p className="error">{errors.lastName.message}</p>
          )}
        </div>
      )}

      {/* Additional fields... */}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Register"}
      </button>
    </form>
  );
}
```

### TanStack Form + Zod

Using TanStack Form with Zod validation:

```tsx
import React from "react";
import { useForm } from "@tanstack/react-form";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { z } from "zod";
import { useLDFlagSchema } from "launchdarkly-flag-form";

const userRegistrationSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),

  lastName: z.string().min(2, "Last name must be at least 2 characters").meta({
    flag: "show-last-name",
    label: "Last Name",
  }),

  email: z.string().email("Invalid email address").meta({
    disabledFlag: "disable-email-editing",
    label: "Email Address",
  }),

  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number")
    .optional()
    .meta({
      flag: "show-phone-field",
      readonlyFlag: "readonly-phone",
      label: "Phone Number",
    }),

  role: z.enum(["Developer", "Designer", "Manager", "Other"]).meta({
    flag: "show-role-field",
    enumValues: ["Developer", "Designer", "Manager", "Other", "Intern"],
    label: "Role",
  }),
});

function TanStackFormZodExample() {
  const flags = {
    "show-last-name": true,
    "disable-email-editing": false,
    "show-phone-field": true,
    "readonly-phone": false,
    "show-role-field": true,
  };

  const {
    visibilityMap,
    disabledMap,
    readOnlyMap,
    schema: transformedSchema,
  } = useLDFlagSchema({
    schema: userRegistrationSchema,
    flags,
  });

  const form = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      role: "",
    },
    onSubmit: async ({ value }) => {
      console.log("Form submitted:", value);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    },
  });

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-4"
      >
        {/* First Name */}
        <form.Field
          name="firstName"
          validatorAdapter={zodValidator}
          validators={{
            onChange: z
              .string()
              .min(2, "First name must be at least 2 characters"),
          }}
        >
          {(field) => (
            <div>
              <label htmlFor="firstName">First Name *</label>
              <input
                id="firstName"
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Enter first name"
              />
              {field.state.meta.errors && (
                <p className="error">{field.state.meta.errors.join(", ")}</p>
              )}
            </div>
          )}
        </form.Field>

        {/* Last Name - Flag controlled */}
        {visibilityMap.lastName && (
          <form.Field
            name="lastName"
            validatorAdapter={zodValidator}
            validators={{
              onChange: z
                .string()
                .min(2, "Last name must be at least 2 characters"),
            }}
          >
            {(field) => (
              <div>
                <label htmlFor="lastName">Last Name *</label>
                <input
                  id="lastName"
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  disabled={disabledMap.lastName}
                  readOnly={readOnlyMap.lastName}
                  placeholder="Enter last name"
                />
                {field.state.meta.errors && (
                  <p className="error">{field.state.meta.errors.join(", ")}</p>
                )}
              </div>
            )}
          </form.Field>
        )}

        {/* Email */}
        <form.Field
          name="email"
          validatorAdapter={zodValidator}
          validators={{
            onChange: z.string().email("Invalid email address"),
          }}
        >
          {(field) => (
            <div>
              <label htmlFor="email">Email *</label>
              <input
                id="email"
                name={field.name}
                type="email"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                disabled={disabledMap.email}
                readOnly={readOnlyMap.email}
                placeholder="Enter email address"
              />
              {field.state.meta.errors && (
                <p className="error">{field.state.meta.errors.join(", ")}</p>
              )}
            </div>
          )}
        </form.Field>

        {/* Phone - Flag controlled */}
        {visibilityMap.phone && (
          <form.Field
            name="phone"
            validatorAdapter={zodValidator}
            validators={{
              onChange: z
                .string()
                .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number")
                .optional(),
            }}
          >
            {(field) => (
              <div>
                <label htmlFor="phone">Phone Number</label>
                <input
                  id="phone"
                  name={field.name}
                  type="tel"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  disabled={disabledMap.phone}
                  readOnly={readOnlyMap.phone}
                  placeholder="+1234567890"
                />
                {field.state.meta.errors && (
                  <p className="error">{field.state.meta.errors.join(", ")}</p>
                )}
              </div>
            )}
          </form.Field>
        )}

        {/* Role - Dynamic enum */}
        {visibilityMap.role && (
          <form.Field
            name="role"
            validatorAdapter={zodValidator}
            validators={{
              onChange: z.enum([
                "Developer",
                "Designer",
                "Manager",
                "Other",
                "Intern",
              ]),
            }}
          >
            {(field) => (
              <div>
                <label htmlFor="role">Role *</label>
                <select
                  id="role"
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  disabled={disabledMap.role}
                >
                  <option value="">Select role</option>
                  <option value="Developer">Developer</option>
                  <option value="Designer">Designer</option>
                  <option value="Manager">Manager</option>
                  <option value="Other">Other</option>
                  <option value="Intern">Intern</option>
                </select>
                {field.state.meta.errors && (
                  <p className="error">{field.state.meta.errors.join(", ")}</p>
                )}
              </div>
            )}
          </form.Field>
        )}

        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
        >
          {([canSubmit, isSubmitting]) => (
            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? "Submitting..." : "Register"}
            </button>
          )}
        </form.Subscribe>
      </form>
    </div>
  );
}
```

### TanStack Form + Yup

Using TanStack Form with Yup validation:

```tsx
import React from "react";
import { useForm } from "@tanstack/react-form";
import { yupValidator } from "@tanstack/yup-form-adapter";
import * as yup from "yup";
import { useLDFlagSchema } from "launchdarkly-flag-form";

const userRegistrationSchema = yup.object({
  firstName: yup
    .string()
    .min(2, "First name must be at least 2 characters")
    .required(),

  lastName: yup
    .string()
    .min(2, "Last name must be at least 2 characters")
    .required()
    .meta({
      flag: "show-last-name",
      label: "Last Name",
    }),

  email: yup.string().email("Invalid email address").required().meta({
    disabledFlag: "disable-email-editing",
    label: "Email Address",
  }),

  phone: yup
    .string()
    .matches(/^\+?[1-9]\d{1,14}$/, "Invalid phone number")
    .meta({
      flag: "show-phone-field",
      readonlyFlag: "readonly-phone",
      label: "Phone Number",
    }),

  role: yup
    .string()
    .oneOf(["Developer", "Designer", "Manager", "Other"])
    .required()
    .meta({
      flag: "show-role-field",
      enumValues: ["Developer", "Designer", "Manager", "Other", "Intern"],
      label: "Role",
    }),
});

function TanStackFormYupExample() {
  const flags = {
    "show-last-name": true,
    "disable-email-editing": false,
    "show-phone-field": true,
    "readonly-phone": false,
    "show-role-field": true,
  };

  const {
    visibilityMap,
    disabledMap,
    readOnlyMap,
    schema: transformedSchema,
  } = useLDFlagSchema({
    schema: userRegistrationSchema,
    flags,
  });

  const form = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      role: "",
    },
    onSubmit: async ({ value }) => {
      console.log("Form submitted:", value);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    },
  });

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-4"
      >
        {/* First Name */}
        <form.Field
          name="firstName"
          validatorAdapter={yupValidator}
          validators={{
            onChange: yup
              .string()
              .min(2, "First name must be at least 2 characters")
              .required(),
          }}
        >
          {(field) => (
            <div>
              <label htmlFor="firstName">First Name *</label>
              <input
                id="firstName"
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Enter first name"
              />
              {field.state.meta.errors && (
                <p className="error">{field.state.meta.errors.join(", ")}</p>
              )}
            </div>
          )}
        </form.Field>

        {/* Last Name - Flag controlled */}
        {visibilityMap.lastName && (
          <form.Field
            name="lastName"
            validatorAdapter={yupValidator}
            validators={{
              onChange: yup
                .string()
                .min(2, "Last name must be at least 2 characters")
                .required(),
            }}
          >
            {(field) => (
              <div>
                <label htmlFor="lastName">Last Name *</label>
                <input
                  id="lastName"
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  disabled={disabledMap.lastName}
                  readOnly={readOnlyMap.lastName}
                  placeholder="Enter last name"
                />
                {field.state.meta.errors && (
                  <p className="error">{field.state.meta.errors.join(", ")}</p>
                )}
              </div>
            )}
          </form.Field>
        )}

        {/* Email */}
        <form.Field
          name="email"
          validatorAdapter={yupValidator}
          validators={{
            onChange: yup.string().email("Invalid email address").required(),
          }}
        >
          {(field) => (
            <div>
              <label htmlFor="email">Email *</label>
              <input
                id="email"
                name={field.name}
                type="email"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                disabled={disabledMap.email}
                readOnly={readOnlyMap.email}
                placeholder="Enter email address"
              />
              {field.state.meta.errors && (
                <p className="error">{field.state.meta.errors.join(", ")}</p>
              )}
            </div>
          )}
        </form.Field>

        {/* Phone - Flag controlled */}
        {visibilityMap.phone && (
          <form.Field
            name="phone"
            validatorAdapter={yupValidator}
            validators={{
              onChange: yup
                .string()
                .matches(/^\+?[1-9]\d{1,14}$/, "Invalid phone number"),
            }}
          >
            {(field) => (
              <div>
                <label htmlFor="phone">Phone Number</label>
                <input
                  id="phone"
                  name={field.name}
                  type="tel"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  disabled={disabledMap.phone}
                  readOnly={readOnlyMap.phone}
                  placeholder="+1234567890"
                />
                {field.state.meta.errors && (
                  <p className="error">{field.state.meta.errors.join(", ")}</p>
                )}
              </div>
            )}
          </form.Field>
        )}

        {/* Role - Dynamic enum */}
        {visibilityMap.role && (
          <form.Field
            name="role"
            validatorAdapter={yupValidator}
            validators={{
              onChange: yup
                .string()
                .oneOf(["Developer", "Designer", "Manager", "Other", "Intern"])
                .required(),
            }}
          >
            {(field) => (
              <div>
                <label htmlFor="role">Role *</label>
                <select
                  id="role"
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  disabled={disabledMap.role}
                >
                  <option value="">Select role</option>
                  <option value="Developer">Developer</option>
                  <option value="Designer">Designer</option>
                  <option value="Manager">Manager</option>
                  <option value="Other">Other</option>
                  <option value="Intern">Intern</option>
                </select>
                {field.state.meta.errors && (
                  <p className="error">{field.state.meta.errors.join(", ")}</p>
                )}
              </div>
            )}
          </form.Field>
        )}

        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
        >
          {([canSubmit, isSubmitting]) => (
            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? "Submitting..." : "Register"}
            </button>
          )}
        </form.Subscribe>
      </form>
    </div>
  );
}
```

### Installation Requirements

For each combination, you'll need these dependencies:

**React Hook Form + Zod:**

```bash
npm install react-hook-form @hookform/resolvers zod launchdarkly-flag-form
```

**React Hook Form + Yup:**

```bash
npm install react-hook-form @hookform/resolvers yup launchdarkly-flag-form
```

**TanStack Form + Zod:**

```bash
npm install @tanstack/react-form @tanstack/zod-form-adapter zod launchdarkly-flag-form
```

**TanStack Form + Yup:**

```bash
npm install @tanstack/react-form @tanstack/yup-form-adapter yup launchdarkly-flag-form
```

---

## 🎯 Use Cases

### Dynamic Default Values

Control form defaults based on user context, preferences, or experiments:

```tsx
const preferencesSchema = z.object({
  theme: z.string().meta({
    defaultValueFlag: "user-preferred-theme", // User's saved preference
  }),

  language: z.string().meta({
    defaultValueFlag: "user-locale", // Based on user location
  }),

  notifications: z.boolean().meta({
    defaultValueFlag: "notifications-enabled", // A/B test default
  }),
});

const userFlags = {
  "user-preferred-theme": user.savedTheme || "light",
  "user-locale": user.detectedLocale || "en",
  "notifications-enabled": experimentVariant === "opt-in" ? true : false,
};

const { defaultValueMap } = useLDFlagSchema({
  schema: preferencesSchema,
  flags: userFlags,
});

// Use in React Hook Form
const { register } = useForm({
  defaultValues: {
    theme: defaultValueMap.theme,
    language: defaultValueMap.language,
    notifications: defaultValueMap.notifications,
  },
});
```

### A/B Testing Forms

```tsx
// Show different form layouts based on experiment flags
const experimentFlags = {
  "experiment-compact-form": true,
  "experiment-show-optional-fields": false,
};
```

### Progressive Feature Rollout

```tsx
// Gradually enable new fields for different user segments
const userFlags = {
  "beta-advanced-settings": user.isBetaUser,
  "premium-features": user.isPremium,
};
```

### Permission-Based Forms

```tsx
// Control field access based on user permissions
const permissionFlags = {
  "can-edit-sensitive-data": user.hasPermission("EDIT_SENSITIVE"),
  "can-view-admin-fields": user.isAdmin,
};
```

### Environment-Specific Behavior

```tsx
// Different form behavior across environments
const envFlags = {
  "development-debug-fields": process.env.NODE_ENV === "development",
  "production-simplified-form": process.env.NODE_ENV === "production",
};
```

---

## 🔗 Integration Examples

### LaunchDarkly SDK

```tsx
import { useFlags } from "@launchdarkly/react-client-sdk";

function LaunchDarklyForm() {
  const ldFlags = useFlags(); // Get all flags from LaunchDarkly

  const { visibilityMap, disabledMap } = useLDFlagSchema({
    schema: userSchema,
    flags: ldFlags,
  });

  // Your form JSX...
}
```

### Environment Variables

```tsx
// Environment variables
const envFlags = {
  "feature-a": process.env.REACT_APP_FEATURE_A === "true",
};

// State management
const [flags, setFlags] = useState(getInitialFlags());
```

---

## 🏗️ Architecture

### Schema Detection

The library automatically detects your schema type:

```tsx
// Automatic detection
const { schema } = useLDFlagSchema({
  schema: zodSchema, // Detected as 'zod'
  flags,
});

const { schema } = useLDFlagSchema({
  schema: yupSchema, // Detected as 'yup'
  flags,
});
```

### Performance Optimizations

- **Memoization**: All computations are memoized with `useMemo`
- **Tree Shaking**: Unused code is automatically removed
- **Type Safe**: Full TypeScript inference with no runtime overhead

---

## 🧪 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/launchdarkly/flag-form.git

# Install dependencies
npm install

# Run tests
npm run test

# Build the library
npm run build
```

---

## 📄 License

MIT © [LaunchDarkly](https://launchdarkly.com)

---

## 🙏 Acknowledgments

- [LaunchDarkly](https://launchdarkly.com/) for feature flag management
- [Zod](https://zod.dev/) and [Yup](https://github.com/jquense/yup) for excellent schema validation
- [React](https://react.dev/) for the amazing hooks ecosystem
