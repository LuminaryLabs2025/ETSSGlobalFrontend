import type { AxiosError } from "axios";
import type { ApiError } from "@/types/api.types";

export const BARRIER_SERIAL_EXISTS_MESSAGE = "Barrier serial number already exists";

export function isBarrierSerialNumberConflict(error: AxiosError<ApiError>): boolean {
  if (error.response?.status !== 409) return false;
  const message = (error.response?.data?.message ?? "").trim();
  return (
    message === BARRIER_SERIAL_EXISTS_MESSAGE
    || message.toLowerCase().includes("serial number already exists")
  );
}

export function formatBarrierSerialNumber(serial: string | null | undefined): string {
  const trimmed = serial?.trim();
  return trimmed ? trimmed : "—";
}