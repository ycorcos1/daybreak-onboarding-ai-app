import { InputHTMLAttributes } from "react";
import BaseTextInput from "@/components/ui/TextInput";

type FormTextInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  helperText?: string;
  error?: string;
};

export function TextInput(props: FormTextInputProps) {
  return <BaseTextInput {...props} />;
}

export default TextInput;
