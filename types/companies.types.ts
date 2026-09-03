export interface CompanyUserType {
  id: string;
  name: string;
  slug?: string | null;
  category?: string | null;
  metadata?: unknown;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CompanyLinkedUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string | null;
  account_type?: string;
  status?: string;
  is_super_admin?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CompanyTeamMember {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CompaniesListParams {
  search?: string;
  user_type_slug?: string;
}

export interface Company {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  user_type_id: string;
  user_type: CompanyUserType | null;
  extra_data?: unknown;
  is_active: boolean;
  users?: CompanyLinkedUser[];
  team_members?: CompanyTeamMember[];
  created_at: string;
  updated_at: string;
}

export type CompanyDetail = Company;

export interface UpdateCompanyPayload {
  name: string;
  address: string;
  phone: string;
  website: string;
  is_active: boolean;
}

export interface CompanyActionResponse {
  message?: string;
}

export interface CompaniesSummary {
  total: number;
  active: number;
  inactive: number;
  by_user_type: { user_type: string; count: number }[];
}
