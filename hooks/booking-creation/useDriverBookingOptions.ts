import { useQuery } from "@tanstack/react-query";
import { driversService } from "@/services/drivers.service";
import type { BookingOptionsParams } from "@/types/booking-creation.types";

export function useDriverBookingOptions(params?: BookingOptionsParams, enabled = true) {
  return useQuery({
    queryKey: ["drivers", "booking-options", params],
    queryFn: () => driversService.bookingOptions(params),
    enabled: enabled && !!params?.transporter_company_id,
  });
}
