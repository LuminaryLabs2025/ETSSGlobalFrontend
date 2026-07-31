import { useMutation, useQueryClient } from "@tanstack/react-query";
import { facilitiesService } from "@/services/facilities.service";
import { toast } from "sonner";
import type { ApiError } from "@/types/api.types";
import type { Facility, UpdateFacilityPayload, EditFacilityInformationPayload } from "@/types/facilities.types";
import { AxiosError } from "axios";

function invalidateFacilities(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["facilities"] });
}

export function useUpdateFacility() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateFacilityPayload }) =>
      facilitiesService.update(id, payload),
    onSuccess: () => invalidateFacilities(queryClient),
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to update facility");
    },
  });
}

export function useEnableFacility() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (facility: Facility) => {
      if (facility.archived_at) {
        return facilitiesService.unarchive(facility.id);
      }
      return facilitiesService.enable(facility.id);
    },
    onSuccess: () => invalidateFacilities(queryClient),
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to enable facility");
    },
  });
}

export function useDisableFacility() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (facility: Facility) => facilitiesService.disable(facility.id),
    onSuccess: () => invalidateFacilities(queryClient),
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to disable facility");
    },
  });
}

export function useArchiveFacility() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: facilitiesService.archive,
    onSuccess: () => invalidateFacilities(queryClient),
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to archive facility");
    },
  });
}

export function useUnarchiveFacility() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: facilitiesService.unarchive,
    onSuccess: () => invalidateFacilities(queryClient),
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to unarchive facility");
    },
  });
}

export function useDeleteFacility() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: facilitiesService.delete,
    onSuccess: () => invalidateFacilities(queryClient),
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to delete facility");
    },
  });
}

export function useEditFacilityInformation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id: _id,
      payload: _payload,
    }: {
      id: string;
      payload: EditFacilityInformationPayload;
    }) => {
      // Mock until dedicated edit-information endpoint is available.
      await new Promise((resolve) => setTimeout(resolve, 700));
      return { message: "Facility information updated successfully." };
    },
    onSuccess: (response) => {
      invalidateFacilities(queryClient);
      toast.success(response.message);
    },
    onError: () => {
      toast.error("Failed to update facility information");
    },
  });
}
