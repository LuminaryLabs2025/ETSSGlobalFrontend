import { useQuery } from "@tanstack/react-query";
import { bookingsService } from "@/services/bookings.service";

export function useBooking(id: string | null) {
  return useQuery({
    queryKey: ["bookings", "detail", id],
    queryFn: () => bookingsService.getById(id!),
    enabled: !!id,
  });
}
