import { useQuery } from "@tanstack/react-query";
import { rfidTagsService } from "@/services/rfid-tags.service";

export function useRfidTag(id: string | null) {
  return useQuery({
    queryKey: ["rfid-tags", "detail", id],
    queryFn: () => rfidTagsService.getById(id!),
    enabled: !!id,
  });
}
