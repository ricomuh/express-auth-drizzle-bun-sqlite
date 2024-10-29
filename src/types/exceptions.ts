// make and error class for the exceptions

import type { BasicErrorResponse } from "./response";

export class ErrorResponse extends Error {
  constructor(
    public message: string,
    public code: number,
    public status: number
  ) {
    super(message);
  }
}

// create a not found error
export class NotFoundError extends ErrorResponse {
  constructor(message: string = "Not found") {
    super(message, 404, 404);
  }
}

// create an unauthorized error
export class UnauthorizedError extends ErrorResponse {
  constructor(message: string = "Unauthorized") {
    super(message, 401, 401);
  }
}

export const internalServerError: BasicErrorResponse = {
  error: {
    code: 500,
    message: "Internal server error",
  },
  status: 500,
};
