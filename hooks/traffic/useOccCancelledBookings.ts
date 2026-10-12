import { useQuery } from "@tanstack/react-query";
import { trafficService } from "@/services/traffic.service";
import type { OccCancelledBookingsParams } from "@/types/traffic.types";

export function useOccCancelledBookings(
  params: OccCancelledBookingsParams,
  enabled = true,
) {
  return useQuery({
    queryKey: ["traffic", "occ", "cancelled-bookings", params],
    queryFn: () => trafficService.cancelledBookings(params),
    enabled,
  });
}
