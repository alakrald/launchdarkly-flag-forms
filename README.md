# 🏁 @launchdarkly/flag-form

A minimal React hook-based library to control form field visibility and state using feature flags — with seamless Zod and Yup integration.

## ✨ Features

- ⚙️ **Framework-agnostic**: Works with React Hook Form, TanStack Form, or any form library
- 🚫 **Zero LaunchDarkly dependencies**: Bring your own feature flag provider
- 🛡️ **Type-safe**: Full TypeScript support with schema validation
- 🎯 **Minimal footprint**: Purely logic-focused, no UI components
- 📦 **Schema extraction**: Automatically extract flagged schemas from Zod and Yup
- 🔧 **Flexible**: Support for visibility flags and disabled state flags

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

This library has peer dependencies on React and optionally Zod/Yup:

```bash
npm install react react-dom
# For Zod support
npm install zod
# For Yup support
npm install yup
```

---

## 🚀 Quick Start

### With Zod Schema

```tsx
import { useLDFlagSchema } from "@launchdarkly/flag-form";
import { z } from "zod";

// Define your Zod schema with metadata
const userSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required").meta({
    flag: "show-last-name",
    label: "Last Name",
  }),
  email: z.email("Invalid email").meta({
    disabledFlag: "disable-email-editing",
    label: "Email Address",
  }),
  phone: z.string().optional().meta({
    flag: "show-phone-field",
    label: "Phone Number",
    type: "tel",
  }),
});

function MyForm() {
  // Your feature flags from any provider
  const flags = {
    "show-last-name": true,
    "show-phone-field": false,
    "disable-email-editing": false,
  };

  const { visibleFields, disabledMap } = useLDFlagSchema({
    schemaType: "zod",
    schema: userSchema,
    flags,
  });

  return (
    <form>
      {visibleFields.map((field) => (
        <div key={field.name}>
          <label>{field.label}</label>
          <input
            type={field.type}
            name={field.name}
            disabled={disabledMap[field.name]}
            required={field.validation?.required}
          />
        </div>
      ))}
    </form>
  );
}
```

### With Yup Schema

```tsx
import { useLDFlagSchema } from "@launchdarkly/flag-form";
import * as yup from "yup";

// Define your Yup schema with metadata
const userSchema = yup.object({
  firstName: yup.string().required("First name is required"),
  lastName: yup.string().required("Last name is required").meta({
    flag: "show-last-name",
    label: "Last Name",
  }),
  email: yup.string().email("Invalid email").required().meta({
    disabledFlag: "disable-email-editing",
    label: "Email Address",
  }),
});

function MyForm() {
  const flags = {
    "show-last-name": true,
    "disable-email-editing": false,
  };

  const { visibleFields, disabledMap } = useLDFlagSchema({
    schemaType: "yup",
    schema: userSchema,
    flags,
  });

  return (
    <form>
      {visibleFields.map((field) => (
        <div key={field.name}>
          <label>{field.label}</label>
          <input
            type={field.type}
            name={field.name}
            disabled={disabledMap[field.name]}
            required={field.validation?.required}
          />
        </div>
      ))}
    </form>
  );
}
```

---

## 📖 Implementation Details

### Core Hook: `useLDFlagSchema`

The main hook that processes Zod/Yup schemas with feature flags to determine field visibility and disabled states.

**Signature:**

```typescript
useLDFlagSchema(params: UseFlaggedSchemaParams) => {
  visibleFields: FlaggedFieldSchema[];
  disabledMap: Record<string, boolean>;
}
```

**Parameters:**

The hook accepts a union type parameter that varies based on schema type:

```typescript
// For Zod schemas
{
  schemaType: "zod";
  schema: ZodObject<ZodRawShape>;
  flags: Record<string, boolean>;
}

// For Yup schemas
{
  schemaType: "yup";
  schema: AnyObjectSchema;
  flags: Record<string, boolean>;
}
```

**Returns:**

- `visibleFields`: Array of fields that should be rendered (based on flag visibility)
- `disabledMap`: Object mapping field names to their disabled state

### Schema Processing Flow

1. **Schema Type Detection**: The hook determines whether you're using Zod or Yup
2. **Metadata Extraction**: Extracts flagging metadata from schema field definitions
3. **Flag Processing**: Applies visibility and disabled state logic based on current flag values
4. **Field Filtering**: Returns only visible fields and disabled state mapping

### Field Visibility Logic

Fields are visible by default. A field becomes hidden when:

1. It has a `flag` property defined in its metadata, AND
2. The corresponding flag value is `false` or `undefined`

```typescript
// Field is visible if no flag is specified OR flag is true
const isVisible = field.flag ? flags[field.flag] : true;
```

### Field Disabled State Logic

Fields are enabled by default. A field becomes disabled when:

1. It has a `disabledFlag` property defined in its metadata, AND
2. The corresponding flag value is `false` (inverted logic)

```typescript
// Field is disabled when disabledFlag exists and is false
const isDisabled = field.disabledFlag ? !flags[field.disabledFlag] : false;
```

### Schema Metadata Format

Both Zod and Yup schemas support metadata through the `.meta()` method:

```typescript
// Metadata interface
interface FieldMetadata {
  flag?: string; // Feature flag name controlling visibility
  disabledFlag?: string; // Feature flag name controlling disabled state
  label?: string; // Display label for the field
  type?: FieldType; // HTML input type
  options?: string[]; // For select fields
  defaultValue?: any; // Default field value
}
```

### Supported Field Types

```typescript
type FieldType =
  | "text"
  | "email"
  | "number"
  | "checkbox"
  | "select"
  | "textarea"
  | "password"
  | "radio"
  | "date"
  | "datetime-local"
  | "time"
  | "url"
  | "tel"
  | "file"
  | "search"
  | "range"
  | "color";
```

---

## 💡 Usage Examples

### React Hook Form + Zod Integration

```bash
npm install react-hook-form @hookform/resolvers zod @launchdarkly/flag-form
```

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLDFlagSchema } from "@launchdarkly/flag-form";

const userSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required").meta({
    flag: "show-last-name",
    label: "Last Name",
  }),
  email: z.email("Invalid email").meta({
    disabledFlag: "disable-email-editing",
    label: "Email Address",
  }),
  role: z
    .enum(["Developer", "Designer", "Manager", "Other"])
    .optional()
    .meta({
      flag: "show-role-field",
      label: "Role",
      type: "select",
      options: ["Developer", "Designer", "Manager", "Other"],
    }),
});

function UserForm() {
  const flags = {
    "show-last-name": true,
    "show-role-field": true,
    "disable-email-editing": false,
  };

  const { visibleFields, disabledMap } = useLDFlagSchema({
    schemaType: "zod",
    schema: userSchema,
    flags,
  });

  // Create dynamic schema for only visible fields
  const dynamicSchema = z.object(
    Object.fromEntries(
      visibleFields.map((field) => [
        field.name,
        userSchema.shape[field.name as keyof typeof userSchema.shape],
      ])
    )
  );

  type FormData = z.infer<typeof dynamicSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(dynamicSchema),
  });

  const onSubmit = (data: FormData) => {
    console.log("Form submitted:", data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {visibleFields.map((field) => (
        <div key={field.name}>
          <label htmlFor={field.name}>
            {field.label}
            {field.validation?.required && (
              <span className="text-red-500">*</span>
            )}
          </label>

          {field.type === "select" ? (
            <select
              id={field.name}
              {...register(field.name)}
              disabled={disabledMap[field.name]}
            >
              <option value="">Select {field.label}</option>
              {field.options?.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          ) : (
            <input
              id={field.name}
              type={field.type}
              {...register(field.name)}
              disabled={disabledMap[field.name]}
            />
          )}

          {errors[field.name] && (
            <p className="text-red-500">{errors[field.name]?.message}</p>
          )}
        </div>
      ))}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
}
```

### React Hook Form + Yup Integration

```bash
npm install react-hook-form @hookform/resolvers yup @launchdarkly/flag-form
```

```tsx
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useLDFlagSchema } from "@launchdarkly/flag-form";

const userSchema = yup.object({
  firstName: yup.string().required("First name is required"),
  lastName: yup.string().required("Last name is required").meta({
    flag: "show-last-name",
    label: "Last Name",
  }),
  email: yup.string().email("Invalid email").required().meta({
    disabledFlag: "disable-email-editing",
    label: "Email Address",
  }),
  role: yup
    .string()
    .oneOf(["Developer", "Designer", "Manager", "Other"])
    .meta({
      flag: "show-role-field",
      label: "Role",
      type: "select",
      options: ["Developer", "Designer", "Manager", "Other"],
    }),
});

function UserFormYup() {
  const flags = {
    "show-last-name": true,
    "show-role-field": false,
    "disable-email-editing": true,
  };

  const { visibleFields, disabledMap } = useLDFlagSchema({
    schemaType: "yup",
    schema: userSchema,
    flags,
  });

  // Create dynamic schema for only visible fields
  const visibleFieldNames = visibleFields.map((f) => f.name);
  const dynamicSchema = yup.object(
    Object.fromEntries(
      Object.entries(userSchema.fields).filter(([key]) =>
        visibleFieldNames.includes(key)
      )
    )
  );

  type FormData = yup.InferType<typeof dynamicSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: yupResolver(dynamicSchema),
  });

  const onSubmit = (data: FormData) => {
    console.log("Form submitted:", data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {visibleFields.map((field) => (
        <div key={field.name}>
          <label htmlFor={field.name}>
            {field.label}
            {field.validation?.required && (
              <span className="text-red-500">*</span>
            )}
          </label>

          {field.type === "select" ? (
            <select
              id={field.name}
              {...register(field.name)}
              disabled={disabledMap[field.name]}
            >
              <option value="">Select {field.label}</option>
              {field.options?.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          ) : (
            <input
              id={field.name}
              type={field.type}
              {...register(field.name)}
              disabled={disabledMap[field.name]}
            />
          )}

          {errors[field.name] && (
            <p className="text-red-500">{errors[field.name]?.message}</p>
          )}
        </div>
      ))}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
}
```

### TanStack Form + Zod Integration

```bash
npm install @tanstack/react-form @tanstack/zod-form-adapter zod @launchdarkly/flag-form
```

```tsx
import { useForm } from "@tanstack/react-form";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { z } from "zod";
import { useLDFlagSchema } from "@launchdarkly/flag-form";

const userSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required").meta({
    flag: "show-last-name",
    label: "Last Name",
  }),
  email: z.email("Invalid email").meta({
    disabledFlag: "disable-email-editing",
    label: "Email Address",
  }),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone")
    .optional()
    .meta({
      flag: "show-phone-field",
      label: "Phone Number",
      type: "tel",
    }),
});

function UserFormTanStack() {
  const flags = {
    "show-last-name": false,
    "show-phone-field": true,
    "disable-email-editing": true,
  };

  const { visibleFields, disabledMap } = useLDFlagSchema({
    schemaType: "zod",
    schema: userSchema,
    flags,
  });

  const form = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
    },
    onSubmit: async ({ value }) => {
      console.log("Form submitted:", value);
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-4"
    >
      {visibleFields.map((field) => (
        <form.Field
          key={field.name}
          name={field.name}
          validatorAdapter={zodValidator}
          validators={{
            onChange:
              userSchema.shape[field.name as keyof typeof userSchema.shape],
          }}
        >
          {(fieldApi) => (
            <div>
              <label htmlFor={field.name}>
                {field.label}
                {field.validation?.required && (
                  <span className="text-red-500">*</span>
                )}
              </label>

              <input
                id={field.name}
                type={field.type}
                value={fieldApi.state.value || ""}
                onBlur={fieldApi.handleBlur}
                onChange={(e) => fieldApi.handleChange(e.target.value)}
                disabled={disabledMap[field.name]}
              />

              {fieldApi.state.meta.errors && (
                <p className="text-red-500">
                  {fieldApi.state.meta.errors.join(", ")}
                </p>
              )}
            </div>
          )}
        </form.Field>
      ))}

      <form.Subscribe
        selector={(state) => [state.canSubmit, state.isSubmitting]}
      >
        {([canSubmit, isSubmitting]) => (
          <button type="submit" disabled={!canSubmit}>
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        )}
      </form.Subscribe>
    </form>
  );
}
```

### Dynamic Flag Updates

```tsx
import { useState } from "react";
import { useLDFlagSchema } from "@launchdarkly/flag-form";

function DynamicFlagsExample() {
  const [flags, setFlags] = useState({
    "show-advanced-fields": false,
    "disable-sensitive-data": true,
  });

  const { visibleFields, disabledMap } = useLDFlagSchema({
    schemaType: "zod",
    schema: userSchema,
    flags,
  });

  // Flags can be updated in real-time
  const toggleAdvanced = () => {
    setFlags((prev) => ({
      ...prev,
      "show-advanced-fields": !prev["show-advanced-fields"],
    }));
  };

  return (
    <div>
      <button onClick={toggleAdvanced}>Toggle Advanced Fields</button>
      <form>
        {visibleFields.map((field) => (
          <FieldComponent
            key={field.name}
            field={field}
            disabled={disabledMap[field.name]}
          />
        ))}
      </form>
    </div>
  );
}
```

### Integration with LaunchDarkly

```tsx
import { useFlags } from "@launchdarkly/react-client-sdk";
import { useLDFlagSchema } from "@launchdarkly/flag-form";

function LaunchDarklyIntegration() {
  const ldFlags = useFlags(); // Get all flags from LaunchDarkly

  const { visibleFields, disabledMap } = useLDFlagSchema({
    schemaType: "zod",
    schema: userSchema,
    flags: ldFlags,
  });

  // Your form rendering logic here...
}
```

---

## 🏗️ Architecture

This library follows a simple, functional approach:

1. **Schema-First**: Define your form structure using existing Zod/Yup schemas
2. **Metadata Enhancement**: Add flagging metadata to schema fields using `.meta()`
3. **Flag Processing**: The hook extracts and processes fields based on current flag values
4. **Framework Agnostic**: Returns processed data that works with any form library
5. **Type Safety**: Full TypeScript support with schema validation and autocompletion

### Processing Flow

```
Zod/Yup Schema + Feature Flags → useLDFlagSchema → {visibleFields, disabledMap}
                                        ↓
                                 Your Form Library
                                        ↓
                                  Rendered Form
```

### Internal Schema Extraction

The library includes two utility functions that automatically extract flagged form schemas:

- `extractFlaggedSchemaFromZod()` - Processes Zod schemas
- `extractFlaggedSchemaFromYup()` - Processes Yup schemas

These functions:

1. Iterate through schema fields
2. Extract metadata from field definitions
3. Convert to a standardized `FlaggedFormSchema` format
4. Apply validation rules and type information

---

## 🔧 Advanced Configuration

### Conditional Field Dependencies

```tsx
// Example: Complex conditional logic
const conditionalSchema = z.object({
  userType: z.enum(["customer", "admin"]).meta({
    label: "User Type",
    type: "select",
    options: ["customer", "admin"],
  }),
  adminSettings: z.string().optional().meta({
    flag: "show-admin-settings", // Show only for admin users
    label: "Admin Settings",
  }),
  customerSupport: z.string().optional().meta({
    flag: "show-customer-support", // Show only for customers
    label: "Customer Support",
  }),
});

// Manage conditional flags based on form state
const updateConditionalFlags = (userType: string) => {
  return {
    "show-admin-settings": userType === "admin",
    "show-customer-support": userType === "customer",
  };
};
```

### Custom Field Types

```tsx
// Extend the FieldType for custom inputs
const customSchema = z.object({
  colorPicker: z.string().meta({
    label: "Theme Color",
    type: "color" as const,
    flag: "show-color-picker",
  }),
  fileUpload: z.string().meta({
    label: "Profile Picture",
    type: "file" as const,
    flag: "show-file-upload",
  }),
  dateRange: z.string().meta({
    label: "Birth Date",
    type: "date" as const,
    flag: "show-birth-date",
  }),
});
```

### Multiple Schema Support

```tsx
// You can use different schemas for different parts of your form
const personalInfoSchema = z.object({
  firstName: z.string().required(),
  lastName: z.string().required().meta({ flag: "show-last-name" }),
});

const contactInfoSchema = z.object({
  email: z.email().required(),
  phone: z.string().optional().meta({ flag: "show-phone" }),
});

function MultiSchemaForm() {
  const personalFields = useLDFlagSchema({
    schemaType: "zod",
    schema: personalInfoSchema,
    flags,
  });

  const contactFields = useLDFlagSchema({
    schemaType: "zod",
    schema: contactInfoSchema,
    flags,
  });

  // Render both sets of fields...
}
```

---

```bash
# Run tests once
npm run test:run

# Run tests in watch mode
npm test

# Run tests with coverage
npm run test:coverage

# Run tests with UI (if @vitest/ui is installed)
npx vitest --ui
```

---

## 🤝 Contributing

This library is designed to be minimal and focused. If you have ideas for improvements:

1. **Maintain Framework Agnosticism**: Ensure changes work with any form library
2. **Keep API Surface Small**: Avoid feature creep and maintain simplicity
3. **Add Comprehensive Types**: Include full TypeScript support for new features
4. **Include Usage Examples**: Add examples in your PR for new functionality
5. **Test Coverage**: Include tests for new features and edge cases

### Development Setup

```bash
git clone https://github.com/your-org/flag-form.git
cd flag-form
npm install
npm run dev
```

### Building

```bash
npm run build
npm run type-check
```

---

## 📄 License

MIT © Alec Aldrine Lakra

---

## 🙏 Acknowledgments

- [LaunchDarkly](https://launchdarkly.com/) for inspiring feature flag-driven development
- [Zod](https://zod.dev/) and [Yup](https://github.com/jquense/yup) for excellent schema validation
- [React Hook Form](https://react-hook-form.com/) and [TanStack Form](https://tanstack.com/form) for form management inspiration
