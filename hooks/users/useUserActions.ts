import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usersService } from "@/services/users.service";
import { toast } from "sonner";
import type { ApiError } from "@/types/api.types";
import { AxiosError } from "axios";

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: usersService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to create user");
    },
  });
}

export function useDisableUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: usersService.disable,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to disable user");
    },
  });
}

export function useEnableUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: usersService.enable,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to enable user");
    },
  });
}

export function useArchiveUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: usersService.archive,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to archive user");
    },
  });
}

export function useResendInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: usersService.resendInvite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to resend invite");
    },
  });
}
