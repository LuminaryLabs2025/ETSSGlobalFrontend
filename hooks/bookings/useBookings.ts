import { useQuery } from "@tanstack/react-query";
import { bookingsService } from "@/services/bookings.service";
import type { BookingsListParams } from "@/types/bookings.types";

const REFETCH_INTERVAL_MS = 30_000;

export function useBookings(params?: BookingsListParams, enabled = true) {
  return useQuery({
    queryKey: ["bookings", "list", params],
    queryFn: () => bookingsService.list(params),
    enabled,
    refetchInterval: REFETCH_INTERVAL_MS,
  });
}
