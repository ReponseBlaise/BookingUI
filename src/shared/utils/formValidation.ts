import { z } from "zod";
import type { ZodTypeAny } from "zod";

/**
 * Parse and validate form data using Zod schema
 * @param schema - Zod validation schema
 * @param data - Form data to validate
 * @returns { success: boolean, data?: T, errors?: Record<string, string> }
 */
export function validateFormData<T>(
  schema: ZodTypeAny,
  data: unknown
): { success: boolean; data?: T; errors?: Record<string, string> } {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData as T };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.issues.forEach((err) => {
        const path = err.path.join(".");
        errors[path] = err.message;
      });
      return { success: false, errors };
    }
    return {
      success: false,
      errors: { form: "Validation failed" },
    };
  }
}

/**
 * Get first error message for a field
 */
export function getFieldError(
  errors: Record<string, string> | undefined,
  fieldName: string
): string | undefined {
  if (!errors) return undefined;
  return errors[fieldName];
}

/**
 * Check if field has error
 */
export function hasFieldError(
  errors: Record<string, string> | undefined,
  fieldName: string
): boolean {
  return Boolean(getFieldError(errors, fieldName));
}

/**
 * Clear field error
 */
export function clearFieldError(
  errors: Record<string, string>,
  fieldName: string
): Record<string, string> {
  const newErrors = { ...errors };
  delete newErrors[fieldName];
  return newErrors;
}

/**
 * Format form data for API submission
 */
export function formatFormData<T extends Record<string, unknown>>(data: T): FormData | T {
  // If there are File instances, use FormData
  const hasFiles = Object.values(data).some((val) => val instanceof File);

  if (hasFiles) {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value instanceof File) {
        formData.append(key, value);
      } else if (Array.isArray(value)) {
        value.forEach((item, index) => {
          if (item instanceof File) {
            formData.append(`${key}[${index}]`, item);
          } else {
            formData.append(`${key}[${index}]`, JSON.stringify(item));
          }
        });
      } else if (value !== null && value !== undefined) {
        formData.append(key, JSON.stringify(value));
      }
    });
    return formData;
  }

  return data;
}

/**
 * Merge form errors
 */
export function mergeFormErrors(
  ...errorArrays: (Record<string, string> | undefined)[]
): Record<string, string> {
  return errorArrays.reduce<Record<string, string>>((acc, errors) => {
    if (errors) {
      return { ...acc, ...errors };
    }
    return acc;
  }, {});
}

/**
 * Transform nested error path to flat object
 */
export function flattenZodErrors(
  error: z.ZodError
): Record<string, string> {
  const errors: Record<string, string> = {};
  error.issues.forEach((err) => {
    const path = err.path.join(".");
    errors[path] = err.message;
  });
  return errors;
}
