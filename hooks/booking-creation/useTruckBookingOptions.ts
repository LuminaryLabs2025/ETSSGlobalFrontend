import { useQuery } from "@tanstack/react-query";
import { trucksService } from "@/services/trucks.service";
import type { BookingOptionsParams } from "@/types/booking-creation.types";

export function useTruckBookingOptions(params?: BookingOptionsParams, enabled = true) {
  return useQuery({
    queryKey: ["trucks", "booking-options", params],
    queryFn: () => trucksService.bookingOptions(params),
    enabled: enabled && !!params?.transporter_company_id,
  });
}
