import { useMutation, useQueryClient } from "@tanstack/react-query";
import { teamService } from "@/services/team.service";
import { toast } from "sonner";
import type { ApiError } from "@/types/api.types";
import { AxiosError } from "axios";

export function useDisableTeamMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: teamService.disable,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to disable team member");
    },
  });
}

export function useEnableTeamMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: teamService.enable,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to enable team member");
    },
  });
}

export function useArchiveTeamMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: teamService.archive,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to archive team member");
    },
  });
}

export function useResendTeamInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: teamService.resendInvite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to resend invite");
    },
  });
}
