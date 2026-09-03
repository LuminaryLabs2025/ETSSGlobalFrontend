import type { Booking } from "@/types/bookings.types";
import type { BookingOpsAction, BookingOpsActionMeta, BookingQueueEntry } from "@/types/booking-ops.types";

export const BOOKING_OPS_ACTIONS: Record<BookingOpsAction, BookingOpsActionMeta> = {
  "mark-in-facility": {
    id: "mark-in-facility",
    label: "Mark In Facility",
    description: "Check truck into the facility",
    branch: "facility",
  },
  "mark-in-pregate": {
    id: "mark-in-pregate",
    label: "Mark In Pregate",
    description: "Check truck into the pregate transit park",
    branch: "pregate",
  },
  "mark-matched": {
    id: "mark-matched",
    label: "Mark Matched",
    description: "Match truck after facility check-in",
    branch: "facility",
  },
  "mark-gtg-facility": {
    id: "mark-gtg-facility",
    label: "Mark GTG (Facility)",
    description: "Grant gate pass — must be #1 in facility queue",
    branch: "facility",
  },
  "mark-gtg-pregate": {
    id: "mark-gtg-pregate",
    label: "Mark GTG (Pregate)",
    description: "Grant gate pass — must be #1 in pregate queue",
    branch: "pregate",
  },
};

export interface BookingLifecycleStep {
  id: string;
  label: string;
  completed: boolean;
  timestamp?: string;
  branch: "payment" | "facility" | "pregate";
}

export function buildBookingLifecycleSteps(booking: Booking): BookingLifecycleStep[] {
  return [
    {
      id: "payment",
      label: "Payment Confirmed",
      completed: booking.payment_status === "PAID",
      timestamp: booking.paid_at ?? booking.confirmed_at,
      branch: "payment",
    },
    {
      id: "in-facility",
      label: "In Facility",
      completed: Boolean(booking.in_facility_at),
      timestamp: booking.in_facility_at,
      branch: "facility",
    },
    {
      id: "in-pregate",
      label: "In Pregate",
      completed: Boolean(booking.in_pregate_at),
      timestamp: booking.in_pregate_at,
      branch: "pregate",
    },
    {
      id: "matched",
      label: "Matched",
      completed: Boolean(booking.matched_at),
      timestamp: booking.matched_at,
      branch: "facility",
    },
    {
      id: "gtg-facility",
      label: "GTG (Facility)",
      completed: Boolean(booking.gtg_facility_at),
      timestamp: booking.gtg_facility_at,
      branch: "facility",
    },
    {
      id: "gtg-pregate",
      label: "GTG (Pregate)",
      completed: Boolean(booking.gtg_pregate_at),
      timestamp: booking.gtg_pregate_at,
      branch: "pregate",
    },
  ];
}

export interface OpsActionAvailability {
  action: BookingOpsAction;
  enabled: boolean;
  reason?: string;
}

export function getOpsActionAvailability(
  booking: Booking,
  options?: {
    facilityQueuePosition?: number;
    pregateQueuePosition?: number;
  },
): OpsActionAvailability[] {
  if (booking.status === "CANCELLED") {
    return [];
  }
  if (booking.payment_status !== "PAID") {
    return [];
  }

  const facilityPos = options?.facilityQueuePosition;
  const pregatePos = options?.pregateQueuePosition;

  return [
    {
      action: "mark-in-facility",
      enabled: !booking.in_facility_at,
      reason: booking.in_facility_at ? "Already checked into facility" : undefined,
    },
    {
      action: "mark-in-pregate",
      enabled: !booking.in_pregate_at,
      reason: booking.in_pregate_at ? "Already checked into pregate" : undefined,
    },
    {
      action: "mark-matched",
      enabled: Boolean(booking.in_facility_at) && !booking.matched_at,
      reason: !booking.in_facility_at
        ? "Requires facility check-in first"
        : booking.matched_at
          ? "Already matched"
          : undefined,
    },
    {
      action: "mark-gtg-facility",
      enabled:
        Boolean(booking.matched_at) &&
        !booking.gtg_facility_at &&
        facilityPos === 1,
      reason: !booking.matched_at
        ? "Requires matching first"
        : booking.gtg_facility_at
          ? "Already GTG at facility"
          : facilityPos == null
            ? "Load facility queue to verify position"
            : facilityPos !== 1
              ? `Must be #1 in facility queue (currently #${facilityPos})`
              : undefined,
    },
    {
      action: "mark-gtg-pregate",
      enabled:
        Boolean(booking.in_pregate_at) &&
        !booking.gtg_pregate_at &&
        pregatePos === 1,
      reason: !booking.in_pregate_at
        ? "Requires pregate check-in first"
        : booking.gtg_pregate_at
          ? "Already GTG at pregate"
          : pregatePos == null
            ? "Load pregate queue to verify position"
            : pregatePos !== 1
              ? `Must be #1 in pregate queue (currently #${pregatePos})`
              : undefined,
    },
  ];
}

export function findQueuePosition(
  queue: BookingQueueEntry[] | undefined,
  bookingId: string,
): number | undefined {
  const entry = queue?.find((item) => item.id === bookingId);
  return entry?.queue_position;
}
