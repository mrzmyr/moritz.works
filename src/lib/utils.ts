import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function tryCatch<T>(promise: Promise<T>): Promise<{
  success: boolean;
  data: T | null;
  error: Error | null;
}> {
  return promise
    .then((data) => ({ success: true, data, error: null }))
    .catch((error) => ({ success: false, data: null, error }));
}
