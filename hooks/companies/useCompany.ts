import { useQuery } from "@tanstack/react-query";
import { companiesService } from "@/services/companies.service";

export function useCompany(id: string | null) {
  return useQuery({
    queryKey: ["companies", "detail", id],
    queryFn: () => companiesService.getById(id!),
    enabled: !!id,
  });
}
