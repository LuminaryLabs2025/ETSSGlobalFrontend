import { useQuery } from "@tanstack/react-query";
import { bookingsService } from "@/services/bookings.service";
import type { BookingsManifestParams } from "@/types/bookings.types";

const REFETCH_INTERVAL_MS = 30_000;

export function useBookingsManifest(params?: BookingsManifestParams, enabled = true) {
  return useQuery({
    queryKey: ["bookings", "manifest", params],
    queryFn: () => bookingsService.manifest(params),
    enabled,
    refetchInterval: REFETCH_INTERVAL_MS,
  });
}
