import { useQuery } from "@tanstack/react-query";
import { revenueService } from "@/services/revenue.service";
import type { RevenueTransactionsListParams } from "@/types/e-revenue.types";

const LIVE_REFETCH_MS = 15_000;

export type RevenueSummaryParams = Omit<
  RevenueTransactionsListParams,
  "page" | "limit"
>;

export function useRevenueSummary(params: RevenueSummaryParams, enabled = true) {
  return useQuery({
    queryKey: ["revenue", "summary", params],
    queryFn: () => revenueService.summary(params),
    enabled,
    refetchInterval: LIVE_REFETCH_MS,
  });
}
