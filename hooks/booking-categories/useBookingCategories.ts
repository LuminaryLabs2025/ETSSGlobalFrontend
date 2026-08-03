import { useQuery } from "@tanstack/react-query";
import { bookingCategoriesService } from "@/services/booking-categories.service";
import type { BookingCategoriesListParams } from "@/types/booking-categories.types";

export function useBookingCategories(params?: BookingCategoriesListParams) {
  return useQuery({
    queryKey: ["booking-categories", params],
    queryFn: () => bookingCategoriesService.list(params),
  });
}
