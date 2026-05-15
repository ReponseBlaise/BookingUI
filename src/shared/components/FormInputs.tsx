import React from "react";

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
}

/**
 * Reusable form input component
 */
export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  (
    {
      label,
      error,
      helperText,
      required,
      className = "",
      ...props
    },
    ref
  ) => {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label className="text-sm font-medium text-gray-700">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          className={`
            px-3 py-2 border rounded-lg
            focus:outline-none focus:ring-2 focus:ring-blue-500
            ${error ? "border-red-500" : "border-gray-300"}
            ${className}
          `}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${props.name}-error` : undefined}
          {...props}
        />
        {error && (
          <span id={`${props.name}-error`} className="text-sm text-red-500">
            {error}
          </span>
        )}
        {helperText && !error && (
          <span className="text-sm text-gray-500">{helperText}</span>
        )}
      </div>
    );
  }
);

FormInput.displayName = "FormInput";

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ value: string | number; label: string }>;
  placeholder?: string;
  required?: boolean;
}

/**
 * Reusable form select component
 */
export const FormSelect = React.forwardRef<HTMLSelectElement, FormSelectProps>(
  (
    {
      label,
      error,
      options,
      placeholder,
      required,
      className = "",
      ...props
    },
    ref
  ) => {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label className="text-sm font-medium text-gray-700">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <select
          ref={ref}
          className={`
            px-3 py-2 border rounded-lg
            focus:outline-none focus:ring-2 focus:ring-blue-500
            ${error ? "border-red-500" : "border-gray-300"}
            ${className}
          `}
          aria-invalid={Boolean(error)}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && (
          <span className="text-sm text-red-500">{error}</span>
        )}
      </div>
    );
  }
);

FormSelect.displayName = "FormSelect";

interface FormTextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  maxLength?: number;
  showCharCount?: boolean;
}

/**
 * Reusable form textarea component
 */
export const FormTextArea = React.forwardRef<
  HTMLTextAreaElement,
  FormTextAreaProps
>(
  (
    {
      label,
      error,
      helperText,
      required,
      maxLength,
      showCharCount,
      value,
      className = "",
      ...props
    },
    ref
  ) => {
    const currentLength = String(value || "").length;

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label className="text-sm font-medium text-gray-700">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          className={`
            px-3 py-2 border rounded-lg resize-none
            focus:outline-none focus:ring-2 focus:ring-blue-500
            ${error ? "border-red-500" : "border-gray-300"}
            ${className}
          `}
          maxLength={maxLength}
          value={value}
          aria-invalid={Boolean(error)}
          {...props}
        />
        <div className="flex justify-between items-start gap-2">
          {error && <span className="text-sm text-red-500">{error}</span>}
          {helperText && !error && (
            <span className="text-sm text-gray-500">{helperText}</span>
          )}
          {showCharCount && maxLength && (
            <span
              className={`text-sm ml-auto ${
                currentLength > maxLength * 0.9 ? "text-orange-500" : "text-gray-500"
              }`}
            >
              {currentLength}/{maxLength}
            </span>
          )}
        </div>
      </div>
    );
  }
);

FormTextArea.displayName = "FormTextArea";

interface FormCheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

/**
 * Reusable form checkbox component
 */
export const FormCheckbox = React.forwardRef<HTMLInputElement, FormCheckboxProps>(
  ({ label, error, className = "", ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            ref={ref}
            type="checkbox"
            className={`
              w-4 h-4 rounded border-gray-300
              focus:ring-2 focus:ring-blue-500
              ${error ? "border-red-500" : ""}
              ${className}
            `}
            aria-invalid={Boolean(error)}
            {...props}
          />
          <span className="text-sm text-gray-700">{label}</span>
        </label>
        {error && (
          <span className="text-sm text-red-500 ml-6">{error}</span>
        )}
      </div>
    );
  }
);

FormCheckbox.displayName = "FormCheckbox";

interface FormFileInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  preview?: boolean;
}

/**
 * Reusable form file input component
 */
export const FormFileInput = React.forwardRef<
  HTMLInputElement,
  FormFileInputProps
>(
  (
    {
      label,
      error,
      helperText,
      required,
      preview,
      className = "",
      ...props
    },
    ref
  ) => {
    const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && preview) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
      props.onChange?.(e);
    };

    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label className="text-sm font-medium text-gray-700">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          type="file"
          className={`
            px-3 py-2 border rounded-lg
            focus:outline-none focus:ring-2 focus:ring-blue-500
            ${error ? "border-red-500" : "border-gray-300"}
            ${className}
          `}
          onChange={handleChange}
          aria-invalid={Boolean(error)}
          {...props}
        />
        {previewUrl && preview && (
          <img
            src={previewUrl}
            alt="Preview"
            className="max-w-xs max-h-40 rounded-lg"
          />
        )}
        {error && (
          <span className="text-sm text-red-500">{error}</span>
        )}
        {helperText && !error && (
          <span className="text-sm text-gray-500">{helperText}</span>
        )}
      </div>
    );
  }
);

FormFileInput.displayName = "FormFileInput";
