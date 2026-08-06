import { useMutation, useQueryClient } from "@tanstack/react-query";
import { transitParksService } from "@/services/transit-parks.service";
import { toast } from "sonner";
import type { ApiError } from "@/types/api.types";
import type { TransitPark, UpdateTransitParkPayload, TransitParkWritePayload } from "@/types/transit-parks.types";
import { AxiosError } from "axios";

function invalidateTransitParks(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["transit-parks"] });
}

export function useUpdateTransitPark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateTransitParkPayload }) =>
      transitParksService.update(id, payload),
    onSuccess: () => invalidateTransitParks(queryClient),
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to update transit park");
    },
  });
}

export function useEnableTransitPark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (park: TransitPark) => {
      if (park.archived_at) {
        return transitParksService.unarchive(park.id);
      }
      return transitParksService.enable(park.id);
    },
    onSuccess: () => invalidateTransitParks(queryClient),
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to enable transit park");
    },
  });
}

export function useDisableTransitPark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (park: TransitPark) => transitParksService.disable(park.id),
    onSuccess: () => invalidateTransitParks(queryClient),
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to disable transit park");
    },
  });
}

export function useArchiveTransitPark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: transitParksService.archive,
    onSuccess: () => invalidateTransitParks(queryClient),
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to archive transit park");
    },
  });
}

export function useUnarchiveTransitPark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: transitParksService.unarchive,
    onSuccess: () => invalidateTransitParks(queryClient),
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to unarchive transit park");
    },
  });
}

export function useDeleteTransitPark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: transitParksService.delete,
    onSuccess: () => invalidateTransitParks(queryClient),
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to delete transit park");
    },
  });
}

export function useCreateTransitPark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: transitParksService.create,
    onSuccess: (response) => {
      invalidateTransitParks(queryClient);
      toast.success(response.message ?? "Transit park created successfully.");
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to create transit park");
    },
  });
}

export function useEditTransitParkInformation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: TransitParkWritePayload;
    }) => transitParksService.update(id, payload),
    onSuccess: (response, variables) => {
      invalidateTransitParks(queryClient);
      queryClient.invalidateQueries({ queryKey: ["transit-parks", "detail", variables.id] });
      toast.success(response.message ?? "Transit park updated successfully.");
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to update transit park");
    },
  });
}
