import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { truckTypesService } from "@/services/truck-types.service";
import type { ApiError } from "@/types/api.types";
import type { TruckTypePayload } from "@/types/truck-types.types";

export function useCreateTruckType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: TruckTypePayload) => truckTypesService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["truck-types"] });
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to create truck type");
    },
  });
}

export function useUpdateTruckType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: TruckTypePayload }) =>
      truckTypesService.update(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["truck-types"] });
      queryClient.invalidateQueries({ queryKey: ["truck-types", "detail", variables.id] });
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to update truck type");
    },
  });
}

export function useDeleteTruckType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: truckTypesService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["truck-types"] });
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to delete truck type");
    },
  });
}
