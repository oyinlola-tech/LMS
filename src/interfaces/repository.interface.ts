export interface Repository<T = any> {
  findById(id: string): Promise<T | null>;
  findAll(where?: Partial<T>): Promise<T[]>;
  create(data: Partial<T>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface FindAllOptions<T = any> {
  where?: Partial<T>;
  include?: any[];
  order?: [string, string][];
  limit?: number;
  offset?: number;
}
