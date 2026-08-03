import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { facilityTimeslotsService } from "@/services/facility-timeslots.service";
import type { ApiError } from "@/types/api.types";
import type { FacilityTimeslotPayload } from "@/types/facility-timeslots.types";

export function useCreateFacilityTimeslot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: FacilityTimeslotPayload) => facilityTimeslotsService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["facility-timeslots"] });
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to create facility timeslot");
    },
  });
}

export function useUpdateFacilityTimeslot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: FacilityTimeslotPayload }) =>
      facilityTimeslotsService.update(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["facility-timeslots"] });
      queryClient.invalidateQueries({ queryKey: ["facility-timeslots", "detail", variables.id] });
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to update facility timeslot");
    },
  });
}

export function useDeleteFacilityTimeslot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: facilityTimeslotsService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["facility-timeslots"] });
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to delete facility timeslot");
    },
  });
}
