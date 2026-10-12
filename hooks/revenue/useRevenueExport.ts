import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { revenueService } from "@/services/revenue.service";
import type { ApiError } from "@/types/api.types";
import type { RevenueTransactionsListParams } from "@/types/e-revenue.types";

export function useRevenueExport() {
  return useMutation({
    mutationFn: (params: RevenueTransactionsListParams) =>
      revenueService.exportCsv(params),
    onSuccess: () => toast.success("Revenue export started"),
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to export revenue data");
    },
  });
}
