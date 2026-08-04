import { useMutation, useQueryClient } from "@tanstack/react-query";
import { driversService } from "@/services/drivers.service";
import { toast } from "sonner";
import type { ApiError } from "@/types/api.types";
import type { CreateDriverPayload, BulkCreateDriversPayload } from "@/types/drivers.types";
import { AxiosError } from "axios";

function invalidateDrivers(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["drivers"] });
}

export function useDisableDriver() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      driversService.disable(id, { reason }),
    onSuccess: () => invalidateDrivers(queryClient),
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to disable driver");
    },
  });
}

export function useArchiveDriver() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: driversService.archive,
    onSuccess: () => invalidateDrivers(queryClient),
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to archive driver");
    },
  });
}

export function useEnableDriver() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: driversService.enable,
    onSuccess: () => invalidateDrivers(queryClient),
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to enable driver");
    },
  });
}

export function useClearDriverFlag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      driversService.clearFlag(id, { reason }),
    onSuccess: () => invalidateDrivers(queryClient),
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to clear flag");
    },
  });
}

export function useStartDriverVerification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: driversService.startVerification,
    onSuccess: () => invalidateDrivers(queryClient),
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to start verification");
    },
  });
}

export function useExportDrivers() {
  return useMutation({
    mutationFn: driversService.exportCsv,
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to export drivers");
    },
  });
}

export function useCreateDriver() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateDriverPayload) => driversService.create(payload),
    onSuccess: () => invalidateDrivers(queryClient),
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to create driver");
    },
  });
}

export function useBulkCreateDrivers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: BulkCreateDriversPayload) => driversService.bulkCreate(payload),
    onSuccess: () => invalidateDrivers(queryClient),
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to bulk create drivers");
    },
  });
}
