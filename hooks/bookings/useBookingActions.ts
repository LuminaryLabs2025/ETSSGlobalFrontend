import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { bookingsService } from "@/services/bookings.service";
import type { ApiError } from "@/types/api.types";
import type { BookingsListParams } from "@/types/bookings.types";

function invalidateBookings(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["bookings"] });
}

export function useRemoveFromManifest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => bookingsService.removeFromManifest(id),
    onSuccess: () => invalidateBookings(queryClient),
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to remove from manifest");
    },
  });
}

export function useAddToManifest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => bookingsService.addToManifest(id),
    onSuccess: () => invalidateBookings(queryClient),
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to add to manifest");
    },
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => bookingsService.cancel(id),
    onSuccess: () => invalidateBookings(queryClient),
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to cancel booking");
    },
  });
}

export function useExportBookings() {
  return useMutation({
    mutationFn: (params?: BookingsListParams) => bookingsService.exportCsv(params),
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to export bookings");
    },
  });
}
