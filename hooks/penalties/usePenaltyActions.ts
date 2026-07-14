import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { penaltiesService } from "@/services/penalties.service";
import type { ApiError } from "@/types/api.types";
import type { PenaltiesListParams, PenaltyPayload } from "@/types/penalties.types";

function invalidatePenalties(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["penalties"] });
}

export function useCreatePenalty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PenaltyPayload) => penaltiesService.create(payload),
    onSuccess: (res) => {
      invalidatePenalties(queryClient);
      toast.success(res.message || "Penalty successfully added.");
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to create penalty");
    },
  });
}

export function useEditPenalty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: PenaltyPayload }) =>
      penaltiesService.edit(id, payload),
    onSuccess: (res) => {
      invalidatePenalties(queryClient);
      toast.success(res.message || "Penalty updated successfully.");
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to update penalty");
    },
  });
}

export function useArchivePenalty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => penaltiesService.archive(id),
    onSuccess: (res) => {
      invalidatePenalties(queryClient);
      toast.success(res.message || "Penalty archived.");
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to archive penalty");
    },
  });
}

export function useExportPenalties() {
  return useMutation({
    mutationFn: (params?: PenaltiesListParams) => penaltiesService.exportCsv(params),
    onSuccess: () => toast.success("Penalties exported successfully."),
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to export penalties");
    },
  });
}
