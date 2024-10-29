export type BasicResponse<T> = {
  data?: T;
  message?: string;
  status: number;
};
export type ErrorResponse<T = null> = BasicResponse & {
  error: {
    code: number;
    message: string;
    details?: string | T;
  };
};
