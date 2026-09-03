import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { bookingsService } from "@/services/bookings.service";
import type { ApiError } from "@/types/api.types";
import type { BookingOpsAction } from "@/types/booking-ops.types";
import type { BookingQueueParams } from "@/types/booking-ops.types";

function invalidateBookingOpsQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  bookingId?: string,
) {
  queryClient.invalidateQueries({ queryKey: ["bookings"] });
  if (bookingId) {
    queryClient.invalidateQueries({ queryKey: ["bookings", "detail", bookingId] });
  }
}

function useBookingOpsMutation(
  action: BookingOpsAction,
  mutateFn: (id: string) => ReturnType<typeof bookingsService.markInFacility>,
  successMessage: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => mutateFn(id),
    onSuccess: (_data, id) => {
      invalidateBookingOpsQueries(queryClient, id);
      toast.success(successMessage);
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? `Failed to ${action.replace(/-/g, " ")}`);
    },
  });
}

export function useMarkInFacility() {
  return useBookingOpsMutation(
    "mark-in-facility",
    bookingsService.markInFacility,
    "Truck marked in facility.",
  );
}

export function useMarkInPregate() {
  return useBookingOpsMutation(
    "mark-in-pregate",
    bookingsService.markInPregate,
    "Truck marked in pregate.",
  );
}

export function useMarkMatched() {
  return useBookingOpsMutation(
    "mark-matched",
    bookingsService.markMatched,
    "Truck marked as matched.",
  );
}

export function useMarkGtgFacility() {
  return useBookingOpsMutation(
    "mark-gtg-facility",
    bookingsService.markGtgFacility,
    "Truck marked GTG at facility.",
  );
}

export function useMarkGtgPregate() {
  return useBookingOpsMutation(
    "mark-gtg-pregate",
    bookingsService.markGtgPregate,
    "Truck marked GTG at pregate.",
  );
}

export function useFacilityQueue(params?: BookingQueueParams, enabled = true) {
  return useQuery({
    queryKey: ["bookings", "queue", "facility", params],
    queryFn: () => bookingsService.queueFacility(params),
    enabled: enabled && !!params?.facility_id,
  });
}

export function usePregateQueue(params?: BookingQueueParams, enabled = true) {
  return useQuery({
    queryKey: ["bookings", "queue", "pregate", params],
    queryFn: () => bookingsService.queuePregate(params),
    enabled: enabled && !!params?.transit_park_id,
  });
}

export function useBookingOpsMutations() {
  const markInFacility = useMarkInFacility();
  const markInPregate = useMarkInPregate();
  const markMatched = useMarkMatched();
  const markGtgFacility = useMarkGtgFacility();
  const markGtgPregate = useMarkGtgPregate();

  const mutationMap = {
    "mark-in-facility": markInFacility,
    "mark-in-pregate": markInPregate,
    "mark-matched": markMatched,
    "mark-gtg-facility": markGtgFacility,
    "mark-gtg-pregate": markGtgPregate,
  } as const;

  const isPending = Object.values(mutationMap).some((m) => m.isPending);

  async function runAction(action: BookingOpsAction, bookingId: string) {
    await mutationMap[action].mutateAsync(bookingId);
  }

  return { runAction, isPending, mutationMap };
}
