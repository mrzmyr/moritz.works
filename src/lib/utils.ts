import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function tryCatch<T>(promise: Promise<T>): Promise<{
  success: boolean;
  data: T | null;
  error: Error | null;
}> {
  try {
    const data = await promise;
    return { success: true, data, error: null };
  } catch (error) {
    return { success: false, data: null, error: error as Error };
  }
}
