import { useQuery } from "@tanstack/react-query";
import { barriersService } from "@/services/barriers.service";

export function useBarrier(id: string | null) {
  return useQuery({
    queryKey: ["barriers", "detail", id],
    queryFn: () => barriersService.getById(id!),
    enabled: !!id,
  });
}
