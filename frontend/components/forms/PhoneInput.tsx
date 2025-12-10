import { ChangeEvent } from "react";
import BaseTextInput from "@/components/ui/TextInput";

type PhoneInputProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  placeholder?: string;
};

export function PhoneInput({
  id,
  label,
  value,
  onChange,
  onBlur,
  required,
  disabled,
  error,
  helperText,
  placeholder,
}: PhoneInputProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/[^\d]/g, "");
    const parts = [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6, 10)].filter(
      (part) => part.length > 0
    );
    const formatted =
      parts.length === 0
        ? ""
        : parts.length === 1
          ? parts[0]
          : parts.length === 2
            ? `${parts[0]}-${parts[1]}`
            : `${parts[0]}-${parts[1]}-${parts[2]}`;
    onChange(formatted);
  };

  return (
    <BaseTextInput
      id={id}
      label={label}
      value={value}
      onChange={handleChange}
      onBlur={onBlur}
      required={required}
      disabled={disabled}
      error={error}
      helperText={helperText}
      placeholder={placeholder ?? "555-123-4567"}
      inputMode="tel"
      pattern="^\\d{3}-\\d{3}-\\d{4}$"
    />
  );
}

export default PhoneInput;
