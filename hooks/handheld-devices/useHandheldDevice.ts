import { useQuery } from "@tanstack/react-query";
import { handheldDevicesService } from "@/services/handheld-devices.service";

export function useHandheldDevice(id: string | null) {
  return useQuery({
    queryKey: ["handheld-devices", "detail", id],
    queryFn: () => handheldDevicesService.getById(id!),
    enabled: !!id,
  });
}
