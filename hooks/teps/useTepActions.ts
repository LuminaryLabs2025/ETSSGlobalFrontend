import { useMutation, useQueryClient } from "@tanstack/react-query";
import { tepsService } from "@/services/teps.service";
import { toast } from "sonner";
import type { ApiError } from "@/types/api.types";
import type { CreateTEPPayload, BulkCreateTEPsPayload } from "@/types/teps.types";
import { AxiosError } from "axios";

function invalidateTeps(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["teps"] });
}

export function useRevokeTEP() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      tepsService.revoke(id, { reason }),
    onSuccess: () => invalidateTeps(queryClient),
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to revoke TEP");
    },
  });
}

export function useExportTeps() {
  return useMutation({
    mutationFn: tepsService.exportCsv,
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to export TEPs");
    },
  });
}

export function useCreateTEP() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTEPPayload) => tepsService.create(payload),
    onSuccess: () => invalidateTeps(queryClient),
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to create TEP");
    },
  });
}

export function useBulkCreateTeps() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: BulkCreateTEPsPayload) => tepsService.bulkCreate(payload),
    onSuccess: () => invalidateTeps(queryClient),
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to bulk upload TEPs");
    },
  });
}
