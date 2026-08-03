import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { bookingCategoriesService } from "@/services/booking-categories.service";
import type { ApiError } from "@/types/api.types";
import type { BookingCategoryPayload } from "@/types/booking-categories.types";

export function useCreateBookingCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: BookingCategoryPayload) => bookingCategoriesService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["booking-categories"] });
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to create booking category");
    },
  });
}

export function useUpdateBookingCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: BookingCategoryPayload }) =>
      bookingCategoriesService.update(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["booking-categories"] });
      queryClient.invalidateQueries({ queryKey: ["booking-categories", "detail", variables.id] });
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to update booking category");
    },
  });
}

export function useDeleteBookingCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bookingCategoriesService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["booking-categories"] });
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to delete booking category");
    },
  });
}
