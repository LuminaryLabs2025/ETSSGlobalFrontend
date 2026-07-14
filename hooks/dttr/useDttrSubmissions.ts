import { useQuery } from "@tanstack/react-query";
import { dttrService } from "@/services/dttr.service";

export function useDttrSubmissions(terminalId: string | null) {
  return useQuery({
    queryKey: ["dttr", "submissions", terminalId],
    queryFn: () => dttrService.submissions(terminalId!),
    enabled: !!terminalId,
  });
}
