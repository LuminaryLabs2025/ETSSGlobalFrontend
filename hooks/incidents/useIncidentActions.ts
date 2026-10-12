import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { incidentsService } from "@/services/incidents.service";
import type { ApiError } from "@/types/api.types";
import type {
  IncidentRejectPayload,
  UpdateIncidentPayload,
} from "@/types/incidents.types";

function invalidateIncidents(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["incidents"] });
}

export function useUpdateIncident() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateIncidentPayload }) =>
      incidentsService.update(id, payload),
    onSuccess: () => invalidateIncidents(queryClient),
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to update incident");
    },
  });
}

export function useApproveCloseIncident() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => incidentsService.approveClose(id),
    onSuccess: () => invalidateIncidents(queryClient),
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to approve and close incident");
    },
  });
}

export function useRejectIncidentResolution() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: IncidentRejectPayload }) =>
      incidentsService.rejectResolution(id, payload),
    onSuccess: () => invalidateIncidents(queryClient),
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to reject resolution");
    },
  });
}

export function useEscalateIncident() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => incidentsService.escalate(id),
    onSuccess: () => invalidateIncidents(queryClient),
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to escalate incident");
    },
  });
}
