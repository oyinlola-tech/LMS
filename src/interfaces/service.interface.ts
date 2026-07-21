export interface Command<TInput = any, TResult = any> {
  execute(input: TInput): Promise<TResult>;
}

export interface Query<TInput = any, TResult = any> {
  execute(input: TInput): Promise<TResult>;
}

export interface PaginatedResult<T> {
  rows: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ServiceResult<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}
