import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { issuedFinesService } from "@/services/issued-fines.service";
import type { ApiError } from "@/types/api.types";
import type { IssuedFinesListParams } from "@/types/penalties.types";

export function useExportIssuedFines() {
  return useMutation({
    mutationFn: (params?: IssuedFinesListParams) => issuedFinesService.exportCsv(params),
    onSuccess: () => toast.success("Issued fines exported successfully."),
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to export issued fines");
    },
  });
}
