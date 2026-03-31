import { toast } from "@/components/ui/use-toast";

export class ToastedError extends Error {
  readonly __toastShown = true;

  constructor(message: string) {
    super(message);
    this.name = "ToastedError";
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

export const isToastedError = (error: unknown): error is ToastedError => {
  return error instanceof ToastedError;
};

export const getErrorMessage = (error: unknown, fallback = "Something went wrong") => {
  if (typeof error === "string" && error.trim().length > 0) {
    return error;
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  if (isRecord(error) && typeof error.message === "string" && error.message.trim().length > 0) {
    return error.message;
  }

  return fallback;
};

export const showErrorToast = (message: string, title = "Error") => {
  toast({
    variant: "destructive",
    title,
    description: message,
  });
};

export const throwToastedError = (message: string, title = "Error"): never => {
  showErrorToast(message, title);
  throw new ToastedError(message);
};

export const notifyUnknownError = (error: unknown, fallback: string, title = "Error") => {
  if (isToastedError(error)) {
    return;
  }

  showErrorToast(getErrorMessage(error, fallback), title);
};
