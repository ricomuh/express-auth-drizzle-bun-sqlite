import type { BasicResponse } from "./response";

export type User = {
  uuid: string;
  name: string;
  email: string;
};

export type RegisterRequest = {
  name: string;
  email: string;
  password: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = BasicResponse<{
  token: string;
  user: {
    name: string;
    email: string;
  };
}>;

export type RegisterResponse = BasicResponse<{
  user: {
    name: string;
    email: string;
  };
}>;
