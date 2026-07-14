import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { dttrService } from "@/services/dttr.service";
import type { ApiError } from "@/types/api.types";
import type {
  ConfigureModePayload,
  EditDttrPayload,
  SubmitDttrPayload,
} from "@/types/dttr.types";

function invalidateDttr(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["dttr"] });
}

export function useSubmitDttrRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: SubmitDttrPayload }) =>
      dttrService.submit(id, payload),
    onSuccess: () => invalidateDttr(queryClient),
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to submit daily request");
    },
  });
}

export function useEditDttr() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: EditDttrPayload }) =>
      dttrService.edit(id, payload),
    onSuccess: () => invalidateDttr(queryClient),
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to update daily request");
    },
  });
}

export function useConfigureDttrMode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ConfigureModePayload }) =>
      dttrService.configureMode(id, payload),
    onSuccess: () => invalidateDttr(queryClient),
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to configure request mode");
    },
  });
}
