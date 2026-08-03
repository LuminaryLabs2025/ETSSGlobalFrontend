import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { facilityTypesService } from "@/services/facility-types.service";
import type { ApiError } from "@/types/api.types";
import type { FacilityTypePayload } from "@/types/facility-types.types";

export function useCreateFacilityType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: FacilityTypePayload) => facilityTypesService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["facility-types"] });
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to create facility type");
    },
  });
}

export function useUpdateFacilityType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: FacilityTypePayload }) =>
      facilityTypesService.update(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["facility-types"] });
      queryClient.invalidateQueries({ queryKey: ["facility-types", "detail", variables.id] });
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to update facility type");
    },
  });
}

export function useDeleteFacilityType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: facilityTypesService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["facility-types"] });
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to delete facility type");
    },
  });
}
