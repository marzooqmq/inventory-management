export interface ApiResponse<T> {
  data: T;
  message?: string;
  status?: string;
  success?: boolean;
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}
