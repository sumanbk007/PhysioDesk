export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

export interface ApiErrorBody {
  error: {
    code: string;
    detail: string;
    status: number;
    errors?: Array<Record<string, unknown>>;
  };
}

export interface MessageResponse {
  message: string;
}

export interface ListFilters {
  page?: number;
  page_size?: number;
  search?: string;
}
