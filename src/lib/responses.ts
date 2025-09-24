export type Response<T> = {
  success: boolean;
  data: T | null;
  error: string | null;
};