import { useQuery } from "@tanstack/react-query";
import { revenueService } from "@/services/revenue.service";
import type { ERevenueModule } from "@/types/e-revenue.types";

export function useRevenueFilterOptions(module: ERevenueModule, enabled = true) {
  return useQuery({
    queryKey: ["revenue", "filter-options", module],
    queryFn: () => revenueService.filterOptions(module),
    enabled,
    staleTime: 60_000,
  });
}