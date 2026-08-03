import apiClient from "@/api/client";
import { COMPANIES } from "@/api/endpoints";
import type {
  Company,
  CompanyActionResponse,
  CompanyDetail,
  UpdateCompanyPayload,
} from "@/types/companies.types";

export const companiesService = {
  list: async (): Promise<Company[]> => {
    const { data } = await apiClient.get<Company[]>(COMPANIES.LIST);
    return data;
  },

  getById: async (id: string): Promise<CompanyDetail> => {
    const { data } = await apiClient.get<CompanyDetail>(COMPANIES.BY_ID(id));
    return data;
  },

  update: async (id: string, payload: UpdateCompanyPayload): Promise<CompanyActionResponse> => {
    const { data } = await apiClient.put<CompanyActionResponse>(COMPANIES.BY_ID(id), payload);
    return data;
  },

  delete: async (id: string): Promise<CompanyActionResponse> => {
    const { data } = await apiClient.delete<CompanyActionResponse>(COMPANIES.BY_ID(id));
    return data;
  },
};
