import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { parkTypesService } from "@/services/park-types.service";
import type { ApiError } from "@/types/api.types";
import type { ParkTypePayload } from "@/types/park-types.types";

export function useCreateParkType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ParkTypePayload) => parkTypesService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["park-types"] });
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to create park type");
    },
  });
}

export function useUpdateParkType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ParkTypePayload }) =>
      parkTypesService.update(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["park-types"] });
      queryClient.invalidateQueries({ queryKey: ["park-types", "detail", variables.id] });
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to update park type");
    },
  });
}

export function useDeleteParkType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: parkTypesService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["park-types"] });
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to delete park type");
    },
  });
}
