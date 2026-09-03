import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { bookingsService } from "@/services/bookings.service";
import type { ApiError } from "@/types/api.types";
import type {
  BookingCreationType,
  ConfirmPaymentRequest,
  CreateEptBookingRequest,
  CreateFacilityBookingRequest,
  CreateFishBookingRequest,
} from "@/types/booking-creation.types";

type CreatePayload =
  | CreateFacilityBookingRequest
  | CreateFishBookingRequest
  | CreateEptBookingRequest;

function handleBookingError(error: AxiosError<ApiError>, fallback: string) {
  toast.error(error.response?.data?.message ?? fallback);
}

export function usePreviewBooking(type: BookingCreationType) {
  return useMutation({
    mutationFn: (payload: CreatePayload) => bookingsService.preview(type, payload),
    onError: (error: AxiosError<ApiError>) => {
      handleBookingError(error, "Failed to preview booking");
    },
  });
}

export function useCreateBooking(type: BookingCreationType) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePayload) => bookingsService.create(type, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
    onError: (error: AxiosError<ApiError>) => {
      handleBookingError(error, "Failed to create booking");
    },
  });
}

export function useConfirmBookingPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ConfirmPaymentRequest }) =>
      bookingsService.confirmPayment(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
    onError: (error: AxiosError<ApiError>) => {
      handleBookingError(error, "Failed to confirm payment");
    },
  });
}
