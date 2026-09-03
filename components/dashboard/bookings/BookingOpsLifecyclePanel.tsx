"use client";

import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import type { Booking } from "@/types/bookings.types";
import type { BookingOpsAction } from "@/types/booking-ops.types";
import {
  BOOKING_OPS_ACTIONS,
  buildBookingLifecycleSteps,
  getOpsActionAvailability,
} from "@/lib/booking-ops-utils";

function formatTimestamp(ts: string) {
  return new Date(ts).toLocaleString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function BookingOpsLifecyclePanel({
  booking,
  facilityQueuePosition,
  pregateQueuePosition,
  onRunAction,
  isPending,
  pendingAction,
}: {
  booking: Booking;
  facilityQueuePosition?: number;
  pregateQueuePosition?: number;
  onRunAction: (action: BookingOpsAction) => void;
  isPending?: boolean;
  pendingAction?: BookingOpsAction | null;
}) {
  const steps = buildBookingLifecycleSteps(booking);
  const actionAvailability = getOpsActionAvailability(booking, {
    facilityQueuePosition,
    pregateQueuePosition,
  });
  const availableActions = actionAvailability.filter((item) => item.enabled);

  const opsTimestamps = [
    { label: "In Facility", value: booking.in_facility_at },
    { label: "In Pregate", value: booking.in_pregate_at },
    { label: "Matched", value: booking.matched_at },
    { label: "GTG Facility", value: booking.gtg_facility_at },
    { label: "GTG Pregate", value: booking.gtg_pregate_at },
  ].filter((item) => item.value);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-bold text-gray-900">Ops Lifecycle</h3>
      <p className="mt-1 text-xs text-gray-500">
        Post-payment operations — facility and pregate branches run independently
      </p>

      {booking.payment_status !== "PAID" && (
        <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Ops actions unlock after payment is confirmed.
        </p>
      )}

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {steps.map((step) => (
          <div
            key={step.id}
            className={`flex items-start gap-2 rounded-lg border px-3 py-2.5 ${
              step.completed
                ? "border-emerald-200 bg-emerald-50/50"
                : "border-gray-100 bg-gray-50/50"
            }`}
          >
            {step.completed ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            ) : (
              <Circle className="mt-0.5 h-4 w-4 shrink-0 text-gray-300" />
            )}
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-900">{step.label}</p>
              {step.timestamp && (
                <p className="mt-0.5 text-[10px] text-gray-500">{formatTimestamp(step.timestamp)}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {opsTimestamps.length > 0 && (
        <div className="mt-4 border-t border-gray-100 pt-4">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
            Lifecycle Timestamps
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {opsTimestamps.map((item) => (
              <div key={item.label} className="text-xs">
                <span className="text-gray-500">{item.label}:</span>{" "}
                <span className="font-medium text-gray-800">{formatTimestamp(item.value!)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {booking.pregate_transit_park && (
        <div className="mt-4 rounded-lg bg-gray-50 px-3 py-2 text-xs">
          <span className="text-gray-500">Pregate:</span>{" "}
          <span className="font-semibold text-gray-800">{booking.pregate_transit_park.name}</span>
        </div>
      )}

      {booking.payment_status === "PAID" && (
        <div className="mt-4 border-t border-gray-100 pt-4">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
            Available Actions
          </p>
          {availableActions.length === 0 ? (
            <p className="text-xs text-gray-500">
              No ops actions available for the current state, or GTG requires queue position #1.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {availableActions.map(({ action }) => {
                const meta = BOOKING_OPS_ACTIONS[action];
                const loading = isPending && pendingAction === action;
                return (
                  <button
                    key={action}
                    type="button"
                    disabled={isPending}
                    onClick={() => onRunAction(action)}
                    title={meta.description}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#0f1e2e] px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#1a3048] disabled:opacity-60"
                  >
                    {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    {meta.label}
                  </button>
                );
              })}
            </div>
          )}

          {actionAvailability
            .filter((item) => !item.enabled && item.reason && booking.payment_status === "PAID")
            .slice(0, 3)
            .map((item) => (
              <p key={item.action} className="mt-2 text-[11px] text-gray-400">
                {BOOKING_OPS_ACTIONS[item.action].label}: {item.reason}
              </p>
            ))}
        </div>
      )}
    </div>
  );
}
