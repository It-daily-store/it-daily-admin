export type TPagination = {
  limit: number;
  currentPage: number;
  total: number;
  totalPage?: number;
  hasMore?: boolean;
};

export type TResponse<T> = {
  statusCode: number;
  success: boolean;
  message?: string;
  pagination?: TPagination;
  data: T;
};
