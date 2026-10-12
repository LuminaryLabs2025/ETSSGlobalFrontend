import { useQuery } from "@tanstack/react-query";
import { revenueService } from "@/services/revenue.service";
import type { RevenueSummaryParams } from "@/hooks/revenue/useRevenueSummary";

const LIVE_REFETCH_MS = 15_000;

export function useRevenueBreakdown(params: RevenueSummaryParams, enabled = true) {
  return useQuery({
    queryKey: ["revenue", "breakdown", params],
    queryFn: () => revenueService.breakdown(params),
    enabled,
    refetchInterval: LIVE_REFETCH_MS,
  });
}
