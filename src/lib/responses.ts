type ErrorResponse<T> = {
  success: false;
  data?: T;
  error: string;
};

type SuccessResponse<T> = {
  success: true;
  data: T;
  error?: string;
};

export type Response<T> = ErrorResponse<T> | SuccessResponse<T>;
