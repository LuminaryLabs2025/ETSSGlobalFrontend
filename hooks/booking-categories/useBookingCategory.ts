import { useQuery } from "@tanstack/react-query";
import { bookingCategoriesService } from "@/services/booking-categories.service";

export function useBookingCategory(id: string | null) {
  return useQuery({
    queryKey: ["booking-categories", "detail", id],
    queryFn: () => bookingCategoriesService.getById(id!),
    enabled: !!id,
  });
}
