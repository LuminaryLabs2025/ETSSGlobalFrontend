import { useQuery } from "@tanstack/react-query";
import { rfidTagsService } from "@/services/rfid-tags.service";
import type { RfidTagsListParams } from "@/types/rfid-tags.types";

export function useRfidTags(params?: RfidTagsListParams) {
  return useQuery({
    queryKey: ["rfid-tags", params],
    queryFn: () => rfidTagsService.list(params),
  });
}
