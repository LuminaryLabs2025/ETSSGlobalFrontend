import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { incidentsService } from "@/services/incidents.service";
import type { ApiError } from "@/types/api.types";
import type {
  IncidentApproveResolutionPayload,
  IncidentAssignPayload,
  IncidentCommentPayload,
  IncidentDeadlinePayload,
  IncidentEmergencyResponsePayload,
  IncidentEscalatePayload,
  IncidentRejectPayload,
  IncidentReopenPayload,
  IncidentRequestEvidencePayload,
  IncidentResolvePayload,
  IncidentSeverityPayload,
} from "@/types/incidents.types";

function invalidateIncidents(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["incidents"] });
}

function onMutationError(message: string) {
  return (error: AxiosError<ApiError>) => {
    toast.error(error.response?.data?.message ?? message);
  };
}

export function useAssignIncident() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: IncidentAssignPayload }) =>
      incidentsService.assign(id, payload),
    onSuccess: () => invalidateIncidents(queryClient),
    onError: onMutationError("Failed to assign incident"),
  });
}

export function useSetIncidentSeverity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: IncidentSeverityPayload }) =>
      incidentsService.setSeverity(id, payload),
    onSuccess: () => invalidateIncidents(queryClient),
    onError: onMutationError("Failed to update severity"),
  });
}

export function useSetIncidentDeadline() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: IncidentDeadlinePayload }) =>
      incidentsService.setDeadline(id, payload),
    onSuccess: () => invalidateIncidents(queryClient),
    onError: onMutationError("Failed to update deadline"),
  });
}

export function useAddIncidentComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: IncidentCommentPayload }) =>
      incidentsService.addComment(id, payload),
    onSuccess: () => invalidateIncidents(queryClient),
    onError: onMutationError("Failed to add comment"),
  });
}

export function useApproveCloseIncident() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload?: IncidentApproveResolutionPayload;
    }) => incidentsService.approveResolution(id, payload),
    onSuccess: () => invalidateIncidents(queryClient),
    onError: onMutationError("Failed to approve and close incident"),
  });
}

export function useRejectIncidentResolution() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: IncidentRejectPayload }) =>
      incidentsService.rejectResolution(id, payload),
    onSuccess: () => invalidateIncidents(queryClient),
    onError: onMutationError("Failed to reject resolution"),
  });
}

export function useEscalateIncident() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: IncidentEscalatePayload }) =>
      incidentsService.escalate(id, payload),
    onSuccess: () => invalidateIncidents(queryClient),
    onError: onMutationError("Failed to escalate incident"),
  });
}

export function useRequestIncidentEvidence() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: IncidentRequestEvidencePayload;
    }) => incidentsService.requestEvidence(id, payload),
    onSuccess: () => invalidateIncidents(queryClient),
    onError: onMutationError("Failed to request evidence"),
  });
}

export function useIncidentEmergencyResponse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: IncidentEmergencyResponsePayload;
    }) => incidentsService.emergencyResponse(id, payload),
    onSuccess: () => invalidateIncidents(queryClient),
    onError: onMutationError("Failed to trigger emergency response"),
  });
}

export function useResolveIncident() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: IncidentResolvePayload }) =>
      incidentsService.resolve(id, payload),
    onSuccess: () => invalidateIncidents(queryClient),
    onError: onMutationError("Failed to resolve incident"),
  });
}

export function useReopenIncident() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: IncidentReopenPayload }) =>
      incidentsService.reopen(id, payload),
    onSuccess: () => invalidateIncidents(queryClient),
    onError: onMutationError("Failed to reopen incident"),
  });
}
