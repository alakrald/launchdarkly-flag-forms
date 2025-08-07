# 🏁 @launchdarkly/flag-form

A powerful React hook library for dynamic form control using feature flags. Transform your forms with real-time field visibility, validation, and behavior based on feature flag values.

## ✨ Features

- 🚀 **React Hook-based**: Simple `useLDFlagSchema` hook for seamless integration
- 🔄 **Dynamic Schema Transformation**: Real-time schema modification based on flag values
- 🛡️ **Type-safe**: Full TypeScript support with Zod and Yup schemas
- ⚡ **Multiple Control Types**: Visibility, disabled state, readonly, required validation
- 🎯 **Framework Agnostic**: Works with any form library (React Hook Form, Formik, etc.)
- 🔧 **Schema Support**: Native Zod and Yup integration with automatic detection
- 📦 **Lightweight**: Minimal bundle size with tree-shaking support
- 🚫 **Zero Dependencies**: No LaunchDarkly SDK required - bring your own flags

---

## 📦 Installation

```bash
npm install @launchdarkly/flag-form
# or
yarn add @launchdarkly/flag-form
# or
pnpm add @launchdarkly/flag-form
```

### Peer Dependencies

```bash
# Required
npm install react react-dom

# Choose your schema library
npm install zod        # For Zod schemas
npm install yup        # For Yup schemas
```

---

## 🚀 Quick Start

### Basic Example with Zod

```tsx
import React from "react";
import { z } from "zod";
import { useLDFlagSchema } from "@launchdarkly/flag-form";

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
    requiredMap,
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
        required={requiredMap.firstName}
      />

      {/* Last name - controlled by flag */}
      {visibilityMap.lastName && (
        <input
          name="lastName"
          placeholder="Last Name"
          disabled={disabledMap.lastName}
          readOnly={readOnlyMap.lastName}
          required={requiredMap.lastName}
        />
      )}

      {/* Email - can be disabled by flag */}
      <input
        name="email"
        type="email"
        placeholder="Email"
        disabled={disabledMap.email}
        readOnly={readOnlyMap.email}
        required={requiredMap.email}
      />

      {/* Phone - multiple flag controls */}
      {visibilityMap.phone && (
        <input
          name="phone"
          placeholder="Phone"
          disabled={disabledMap.phone}
          readOnly={readOnlyMap.phone}
          required={requiredMap.phone}
        />
      )}
    </form>
  );
}
```

### Basic Example with Yup

```tsx
import * as yup from "yup";
import { useLDFlagSchema } from "@launchdarkly/flag-form";

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
  username: z.string().min(3).meta({
    minValue: 5, // Dynamic min length
    requiredFlag: "username-required",
  }),

  role: z.enum(["user", "admin"]).meta({
    enumValues: ["user", "admin", "moderator"], // Dynamic enum values
    flag: "show-role",
  }),

  settings: z.object({
    theme: z.string().meta({
      defaultValue: "dark", // Dynamic default value
      omitFlag: "hide-settings",
    }),
  }),
});

const flags = {
  "username-required": true,
  "show-role": true,
  "hide-settings": false,
};

const { schema: transformedSchema } = useLDFlagSchema({
  schema: dynamicSchema,
  flags,
});

// transformedSchema is now modified based on flag values
// - username has min length of 5 and is required
// - role includes 'moderator' option
// - settings.theme defaults to 'dark'
```

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
    resolver: zodResolver(transformedSchema), // Use transformed schema
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
  visibilityMap: Record<string, boolean>; // Field visibility states
  disabledMap: Record<string, boolean>; // Field disabled states
  readOnlyMap: Record<string, boolean>; // Field readonly states
  requiredMap: Record<string, boolean>; // Field required states
  schema: TransformedSchema; // Dynamically modified schema
}
```

### Meta Properties

Add these properties to your schema field's `.meta()` to enable flag control:

```typescript
interface FieldMeta {
  // Control flags
  flag?: string; // Controls field visibility
  disabledFlag?: string; // Controls disabled state
  readonlyFlag?: string; // Controls readonly state
  requiredFlag?: string; // Controls required validation
  omitFlag?: string; // Omits field from schema entirely

  // Dynamic values
  minValue?: number; // Dynamic minimum value/length
  maxValue?: number; // Dynamic maximum value/length
  enumValues?: Array<any>; // Dynamic enum/select options
  defaultValue?: any; // Dynamic default value

  // Display properties
  label?: string; // Field label
}
```

### Flag Control Logic

| Flag Type           | `true`       | `false`      | `undefined` |
| ------------------- | ------------ | ------------ | ----------- |
| `flag` (visibility) | Visible      | Hidden       | Visible     |
| `disabledFlag`      | Enabled      | **Disabled** | Enabled     |
| `readonlyFlag`      | **Readonly** | Editable     | Editable    |
| `requiredFlag`      | **Required** | Optional     | Optional    |
| `omitFlag`          | Included     | **Omitted**  | Included    |

---

## 📚 Framework Integration Examples

### React Hook Form + Zod

Complete example with form validation and flag-controlled fields:

```tsx
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLDFlagSchema } from "@launchdarkly/flag-form";

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
    resolver: zodResolver(transformedSchema),
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
import { useLDFlagSchema } from "@launchdarkly/flag-form";

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
    resolver: yupResolver(transformedSchema),
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
import { useLDFlagSchema } from "@launchdarkly/flag-form";

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
import { useLDFlagSchema } from "@launchdarkly/flag-form";

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
npm install react-hook-form @hookform/resolvers zod @launchdarkly/flag-form
```

**React Hook Form + Yup:**

```bash
npm install react-hook-form @hookform/resolvers yup @launchdarkly/flag-form
```

**TanStack Form + Zod:**

```bash
npm install @tanstack/react-form @tanstack/zod-form-adapter zod @launchdarkly/flag-form
```

**TanStack Form + Yup:**

```bash
npm install @tanstack/react-form @tanstack/yup-form-adapter yup @launchdarkly/flag-form
```

---

## 🎯 Use Cases

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

## 🔄 LaunchDarkly Integration

While this library doesn't depend on LaunchDarkly's SDK, it integrates seamlessly:

```tsx
import { useFlags } from "@launchdarkly/react-client-sdk";

function LaunchDarklyForm() {
  const ldFlags = useFlags(); // Get all flags from LaunchDarkly

  const { visibilityMap, disabledMap } = useLDFlagSchema({
    schema: userSchema,
    flags: ldFlags,
  });

  // Your form logic here
}
```

### Other Flag Providers

Works with any flag system:

```tsx
// Custom flag provider
const customFlags = useCustomFlags();

// Environment variables
const envFlags = {
  "feature-a": process.env.REACT_APP_FEATURE_A === "true",
};

// Context/state management
const contextFlags = useContext(FeatureFlagContext);

// All work the same way
const result = useLDFlagSchema({ schema, flags: anyFlagSource });
```

---

## 🏗️ Architecture

### Schema Detection

The library automatically detects whether you're using Zod or Yup:

```typescript
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

### Transformation Pipeline

1. **Schema Analysis**: Extract metadata from schema fields
2. **Flag Processing**: Apply flag values to field controls
3. **Schema Transformation**: Create new schema with dynamic values
4. **State Mapping**: Generate control maps for UI rendering

### Performance

- **Memoized**: All computations are memoized for optimal performance
- **Selective Updates**: Only re-compute when schema or flags change
- **Tree Shaking**: Unused code is automatically removed
- **Type Safe**: Full TypeScript inference with no runtime overhead

---

## 🔧 Development

### Build Commands

```bash
# Build the library
npm run build

# Type checking
npm run type-check

# Clean build artifacts
npm run clean
```

### Project Structure

```
src/
├── hooks/
│   └── use-ld-flag-schema.ts    # Main hook implementation
├── types/
│   └── schema.ts                # TypeScript definitions
├── utils/
│   └── index.ts                 # Utility functions
├── zod/
│   └── extract-flagged-schema-from-zod.ts
└── yup/
    └── extract-flagged-schema-from-yup.ts
```

---

## 🤝 Contributing

We welcome contributions! Please:

1. **Maintain Compatibility**: Ensure changes work with both Zod and Yup
2. **Add Tests**: Include comprehensive test coverage
3. **Type Safety**: Maintain full TypeScript support
4. **Documentation**: Update README and add examples

---

## 📄 License

MIT © Alec Aldrine Lakra

---

## 🙏 Acknowledgments

- [LaunchDarkly](https://launchdarkly.com/) for pioneering feature flag-driven development
- [Zod](https://zod.dev/) and [Yup](https://github.com/jquense/yup) for excellent schema validation
- [React](https://react.dev/) for the amazing hooks ecosystem
