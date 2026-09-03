export type BookingCreationType = "bonded-terminal" | "truck-park" | "fish" | "ept";

export type BookingTypeEnum = "BONDED_TERMINAL" | "TRUCK_PARK" | "FISH_VAN_PARK" | "EPT";

export type BookingPriorityLevel = "HIGH" | "MEDIUM" | "LOW";

export type BookingPaymentStatus = "PENDING" | "PAID" | "FAILED";

export type BookingPaymentMethod = "WALLET" | "PAYSTACK";

export interface BookingPreviewEntity {
  id: string;
  name: string;
  code?: string;
  location?: string;
  type?: string;
}

export interface BookingPreviewTimeslot {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
}

export interface BookingPreviewFeeLine {
  name: string;
  amount: number;
}

export interface BookingPreviewFee {
  fee_configured: boolean;
  total: number;
  lines: BookingPreviewFeeLine[];
}

export interface BookingPreview {
  booking_type: BookingTypeEnum;
  facility?: BookingPreviewEntity;
  transit_park?: BookingPreviewEntity;
  terminal: BookingPreviewEntity;
  truck: { id: string; plate_number: string };
  driver: { id: string; name: string };
  transporter_company: { id: string; name: string };
  booking_category_ref?: { id: string; name: string };
  export_type?: string | null;
  ept_operation_type?: string | null;
  gate_pass_number?: string | null;
  gate_pass_matched: boolean;
  expected_arrival_date: string;
  expected_arrival_time?: string | null;
  expected_arrival_time_slot?: BookingPreviewTimeslot;
  priority_level: BookingPriorityLevel;
  priority_rank: number;
  fee: BookingPreviewFee;
}

export interface CreateFacilityBookingRequest {
  facility_id: string;
  transporter_company_id: string;
  truck_id: string;
  driver_id: string;
  terminal_id: string;
  booking_category_id: string;
  expected_arrival_date: string;
  expected_arrival_time_slot_id: string;
}

export interface CreateFishBookingRequest {
  facility_id: string;
  transporter_company_id: string;
  truck_id: string;
  driver_id: string;
  terminal_id: string;
  expected_arrival_date: string;
  expected_arrival_time_slot_id?: string;
  gate_pass_number?: string;
}

export type EptExportType = "AGRO_EXPORT" | "MANUFACTURED_EXPORT" | "OTHERS";

export type EptOperationType =
  | "LOADED_EXPORT_DELIVERY"
  | "EMPTY_CONTAINER_DELIVERY"
  | "VERIFIED_EXPORT_COLLECTION"
  | "LOADED_DELIVERY_WITH_COLLECTION";

export interface CreateEptBookingRequest {
  transporter_company_id: string;
  export_type: EptExportType;
  truck_id: string;
  driver_id: string;
  transit_park_id: string;
  ept_operation_type: EptOperationType;
  terminal_id: string;
  expected_arrival_date: string;
  expected_arrival_time: string;
  gate_pass_number: string;
}

export interface ConfirmPaymentRequest {
  payment_method: BookingPaymentMethod;
  terms_accepted: true;
}

export interface BookingOption {
  value: string;
  label: string;
  group: "mine" | "public";
}

export interface BookingOptionsResponse {
  mine: BookingOption[];
  public: BookingOption[];
}

export interface BookingOptionsParams {
  transporter_company_id?: string;
  search?: string;
}
