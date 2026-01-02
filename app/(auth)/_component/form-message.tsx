import { TriangleAlert, MailCheck } from "lucide-react";

interface FormProps {
  message?: string;
}

export const FormError = ({ message }: FormProps) => {
  if (!message) return null;

  return (
    <div className="bg-destructive/15 text-destructive flex items-center gap-x-2 rounded-md p-3 text-sm">
      <TriangleAlert className="h-4 w-4" />
      <p>{message}</p>
    </div>
  );
};

export const FormSuccess = ({ message }: FormProps) => {
  if (!message) return null;
  return (
    <div className="flex items-center gap-x-2 rounded-md bg-emerald-500/15 p-3 text-sm text-emerald-500">
      <MailCheck className="h-4 w-4" />
      <p>{message}</p>
    </div>
  );
};