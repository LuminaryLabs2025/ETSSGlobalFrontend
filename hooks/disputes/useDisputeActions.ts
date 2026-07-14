import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { disputesService } from "@/services/disputes.service";
import type { ApiError } from "@/types/api.types";
import type { DisputesListParams, ResolveDisputePayload } from "@/types/penalties.types";

function invalidateDisputes(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["disputes"] });
  queryClient.invalidateQueries({ queryKey: ["issued-fines"] });
}

export function useResolveDispute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ResolveDisputePayload }) =>
      disputesService.resolve(id, payload),
    onSuccess: (res) => {
      invalidateDisputes(queryClient);
      toast.success(res.message || "Dispute status updated successfully.");
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to update dispute");
    },
  });
}

export function useExportDisputes() {
  return useMutation({
    mutationFn: (params?: DisputesListParams) => disputesService.exportCsv(params),
    onSuccess: () => toast.success("Disputes exported successfully."),
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to export disputes");
    },
  });
}
