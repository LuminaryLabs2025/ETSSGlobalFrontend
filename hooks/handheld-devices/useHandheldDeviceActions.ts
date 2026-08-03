import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { handheldDevicesService } from "@/services/handheld-devices.service";
import type { ApiError } from "@/types/api.types";
import type { HandheldDevicePayload } from "@/types/handheld-devices.types";

export function useCreateHandheldDevice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: HandheldDevicePayload) => handheldDevicesService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["handheld-devices"] });
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to create handheld device");
    },
  });
}

export function useUpdateHandheldDevice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: HandheldDevicePayload }) =>
      handheldDevicesService.update(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["handheld-devices"] });
      queryClient.invalidateQueries({ queryKey: ["handheld-devices", "detail", variables.id] });
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to update handheld device");
    },
  });
}

export function useDeleteHandheldDevice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: handheldDevicesService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["handheld-devices"] });
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to delete handheld device");
    },
  });
}
