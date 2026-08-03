export type InfractionCategoryStatus = "ACTIVE" | "INACTIVE" | string;

export interface InfractionCategory {
  id: string;
  name: string;
  fine_amount: number;
  status: InfractionCategoryStatus;
  created_by?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export type InfractionCategoryDetail = InfractionCategory;

export interface InfractionCategoriesListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export interface InfractionCategoriesListResponse {
  data: InfractionCategory[];
  meta: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

export interface InfractionCategoryPayload {
  name: string;
  fine_amount: number;
  status: string;
}

export interface InfractionCategoryActionResponse {
  message?: string;
  data?: InfractionCategory;
}
