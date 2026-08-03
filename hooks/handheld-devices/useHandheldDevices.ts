import { useQuery } from "@tanstack/react-query";
import { handheldDevicesService } from "@/services/handheld-devices.service";
import type { HandheldDevicesListParams } from "@/types/handheld-devices.types";

export function useHandheldDevices(params?: HandheldDevicesListParams) {
  return useQuery({
    queryKey: ["handheld-devices", params],
    queryFn: () => handheldDevicesService.list(params),
  });
}
