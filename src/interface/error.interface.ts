export interface TErrorSourse {
  path: string | number;
  message: string;
}

export interface TGenericErrorResponse {
  statusCode: number;
  success: boolean;
  message: string;
  errorSources: TErrorSourse[];
  stack?: string | null;
}
