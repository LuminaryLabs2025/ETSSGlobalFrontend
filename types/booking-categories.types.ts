export type BookingCategoryStatus = "ACTIVE" | "INACTIVE" | string;

export interface BookingCategory {
  id: string;
  name: string;
  status: BookingCategoryStatus;
  created_by?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export type BookingCategoryDetail = BookingCategory;

export interface BookingCategoriesListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export interface BookingCategoriesListResponse {
  data: BookingCategory[];
  meta: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

export interface BookingCategoryPayload {
  name: string;
  status: string;
}

export interface BookingCategoryActionResponse {
  message?: string;
  data?: BookingCategory;
}
