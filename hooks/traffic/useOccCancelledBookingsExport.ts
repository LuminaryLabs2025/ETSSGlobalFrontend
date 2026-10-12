import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { trafficService } from "@/services/traffic.service";
import type { ApiError } from "@/types/api.types";
import type { OccCancelledBookingsParams } from "@/types/traffic.types";

export function useOccCancelledBookingsExport() {
  return useMutation({
    mutationFn: (params: OccCancelledBookingsParams) =>
      trafficService.exportCancelledBookings(params),
    onSuccess: () => toast.success("Cancelled bookings export started"),
    onError: (error: AxiosError<ApiError>) => {
      toast.error(
        error.response?.data?.message ?? "Failed to export cancelled bookings",
      );
    },
  });
}
