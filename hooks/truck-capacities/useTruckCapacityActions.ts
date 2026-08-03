import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { truckCapacitiesService } from "@/services/truck-capacities.service";
import type { ApiError } from "@/types/api.types";
import type { TruckCapacityPayload } from "@/types/truck-capacities.types";

export function useCreateTruckCapacity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: TruckCapacityPayload) => truckCapacitiesService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["truck-capacities"] });
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to create truck capacity");
    },
  });
}

export function useUpdateTruckCapacity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: TruckCapacityPayload }) =>
      truckCapacitiesService.update(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["truck-capacities"] });
      queryClient.invalidateQueries({ queryKey: ["truck-capacities", "detail", variables.id] });
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to update truck capacity");
    },
  });
}

export function useDeleteTruckCapacity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: truckCapacitiesService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["truck-capacities"] });
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to delete truck capacity");
    },
  });
}
