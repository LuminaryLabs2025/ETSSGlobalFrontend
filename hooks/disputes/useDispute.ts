import { useQuery } from "@tanstack/react-query";
import { disputesService } from "@/services/disputes.service";

export function useDispute(id: string | null, enabled = true) {
  return useQuery({
    queryKey: ["disputes", "detail", id],
    queryFn: () => disputesService.getById(id!),
    enabled: enabled && Boolean(id),
  });
}
