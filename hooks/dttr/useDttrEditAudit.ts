import { useQuery } from "@tanstack/react-query";
import { dttrService } from "@/services/dttr.service";

export function useDttrEditAudit(enabled = true) {
  return useQuery({
    queryKey: ["dttr", "edit-audit"],
    queryFn: () => dttrService.editAudit(),
    enabled,
  });
}
