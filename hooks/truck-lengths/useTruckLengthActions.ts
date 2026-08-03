import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { truckLengthsService } from "@/services/truck-lengths.service";
import type { ApiError } from "@/types/api.types";
import type { TruckLengthPayload } from "@/types/truck-lengths.types";

export function useCreateTruckLength() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: TruckLengthPayload) => truckLengthsService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["truck-lengths"] });
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to create truck length");
    },
  });
}

export function useUpdateTruckLength() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: TruckLengthPayload }) =>
      truckLengthsService.update(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["truck-lengths"] });
      queryClient.invalidateQueries({ queryKey: ["truck-lengths", "detail", variables.id] });
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to update truck length");
    },
  });
}

export function useDeleteTruckLength() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: truckLengthsService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["truck-lengths"] });
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to delete truck length");
    },
  });
}
