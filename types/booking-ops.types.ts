import type { Booking } from "@/types/bookings.types";

export type BookingOpsAction =
  | "mark-in-facility"
  | "mark-in-pregate"
  | "mark-matched"
  | "mark-gtg-facility"
  | "mark-gtg-pregate";

export interface BookingQueueEntry extends Booking {
  queue_position: number;
}

export interface BookingQueueParams {
  facility_id?: string;
  terminal_id?: string;
  page?: number;
  limit?: number;
}

export interface BookingQueueResponse {
  data: BookingQueueEntry[];
  meta: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

export interface BookingOpsActionMeta {
  id: BookingOpsAction;
  label: string;
  description: string;
  branch: "facility" | "pregate" | "shared";
}
