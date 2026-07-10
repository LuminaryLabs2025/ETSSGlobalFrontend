import { useMutation, useQueryClient } from "@tanstack/react-query";
import { trucksService } from "@/services/trucks.service";
import { toast } from "sonner";
import type { ApiError } from "@/types/api.types";
import type { CreateTruckPayload, BulkCreateTrucksPayload } from "@/types/trucks.types";
import { AxiosError } from "axios";

function invalidateTrucks(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["trucks"] });
}

export function useDisableTruck() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      trucksService.disable(id, { reason }),
    onSuccess: () => invalidateTrucks(queryClient),
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to disable truck");
    },
  });
}

export function useArchiveTruck() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: trucksService.archive,
    onSuccess: () => invalidateTrucks(queryClient),
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to archive truck");
    },
  });
}

export function useReEnableTruck() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      trucksService.reEnable(id, { reason }),
    onSuccess: () => invalidateTrucks(queryClient),
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to re-enable truck");
    },
  });
}

export function useOverrideTruckPenalty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      trucksService.overridePenalty(id, { reason }),
    onSuccess: () => invalidateTrucks(queryClient),
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to override penalty");
    },
  });
}

export function useRequestTruckVerification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: trucksService.requestVerification,
    onSuccess: () => invalidateTrucks(queryClient),
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to request verification");
    },
  });
}

export function useExportTrucks() {
  return useMutation({
    mutationFn: trucksService.exportCsv,
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to export trucks");
    },
  });
}

export function useCreateTruck() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTruckPayload) => trucksService.create(payload),
    onSuccess: () => invalidateTrucks(queryClient),
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to create truck");
    },
  });
}

export function useBulkCreateTrucks() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: BulkCreateTrucksPayload) => trucksService.bulkCreate(payload),
    onSuccess: () => invalidateTrucks(queryClient),
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to bulk create trucks");
    },
  });
}
