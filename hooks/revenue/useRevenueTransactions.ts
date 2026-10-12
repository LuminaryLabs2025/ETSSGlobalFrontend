import { useQuery } from "@tanstack/react-query";
import { revenueService } from "@/services/revenue.service";
import type { RevenueTransactionsListParams } from "@/types/e-revenue.types";

const LIVE_REFETCH_MS = 15_000;

export function useRevenueTransactions(
  params: RevenueTransactionsListParams,
  enabled = true,
) {
  return useQuery({
    queryKey: ["revenue", "transactions", params],
    queryFn: () => revenueService.listTransactions(params),
    enabled,
    refetchInterval: LIVE_REFETCH_MS,
  });
}
