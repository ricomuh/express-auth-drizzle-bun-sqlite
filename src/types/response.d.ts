export type BasicResponse<T> = {
  data?: T;
  message?: string;
  status: number;
};
export type BasicErrorResponse<T = null> = BasicResponse & {
  error: {
    code: number;
    message: string;
    details?: string | T;
  };
};
