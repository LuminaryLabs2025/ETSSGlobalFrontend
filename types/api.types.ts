// ─── Generic API response shape ───
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// ─── Paginated responses ───
export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ─── API error shape ───
export interface ApiError {
  statusCode: number;
  message: string;
  timestamp: string;
  path: string;
}
