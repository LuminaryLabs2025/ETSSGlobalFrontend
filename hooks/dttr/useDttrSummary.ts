import { useQuery } from "@tanstack/react-query";
import { dttrService } from "@/services/dttr.service";

export function useDttrSummary() {
  return useQuery({
    queryKey: ["dttr", "summary"],
    queryFn: () => dttrService.summary(),
  });
}
