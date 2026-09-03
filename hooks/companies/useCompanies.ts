import { useQuery } from "@tanstack/react-query";
import { companiesService } from "@/services/companies.service";
import type { CompaniesListParams } from "@/types/companies.types";

export function useCompanies(params?: CompaniesListParams, enabled = true) {
  return useQuery({
    queryKey: ["companies", params],
    queryFn: () => companiesService.list(params),
    enabled,
  });
}
