import { useQuery } from "@tanstack/react-query";
import { companiesService } from "@/services/companies.service";

export function useCompanies() {
  return useQuery({
    queryKey: ["companies"],
    queryFn: () => companiesService.list(),
  });
}
