import { useQuery } from "@tanstack/react-query";
import { transitParksService } from "@/services/transit-parks.service";

export function useTransitParksSummary() {
  return useQuery({
    queryKey: ["transit-parks", "summary"],
    queryFn: transitParksService.summary,
  });
}
