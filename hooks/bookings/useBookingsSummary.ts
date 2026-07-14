import { useQuery } from "@tanstack/react-query";
import { bookingsService } from "@/services/bookings.service";

const REFETCH_INTERVAL_MS = 30_000;

export function useBookingsSummary(enabled = true) {
  return useQuery({
    queryKey: ["bookings", "summary"],
    queryFn: () => bookingsService.summary(),
    enabled,
    refetchInterval: REFETCH_INTERVAL_MS,
  });
}
