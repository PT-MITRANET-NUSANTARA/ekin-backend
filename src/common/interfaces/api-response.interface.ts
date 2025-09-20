export interface PaginationMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface ApiResponse<T = any> {
  code: number;
  status: boolean;
  message: string;
  data: T;
  pagination?: PaginationMeta | null;
}
