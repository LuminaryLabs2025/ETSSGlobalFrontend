import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { profileService } from "@/services/profile.service";
import type { ApiError } from "@/types/api.types";

export function useSetup2FA() {
  return useMutation({
    mutationFn: profileService.setup2FA,
    onError: (error: AxiosError<ApiError>) => {
      const message =
        error.response?.data?.message ??
        "Failed to set up authenticator. Please try again.";
      toast.error(message);
    },
  });
}

export function useVerify2FA() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: profileService.verify2FA,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Authenticator app verified and enabled.");
    },
    onError: (error: AxiosError<ApiError>) => {
      const message =
        error.response?.data?.message ??
        "Invalid code. Please try again.";
      toast.error(message);
    },
  });
}

export function useChange2FAMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: profileService.change2FAMethod,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Two-factor method updated.");
    },
    onError: (error: AxiosError<ApiError>) => {
      const message =
        error.response?.data?.message ??
        "Failed to change 2FA method. Please try again.";
      toast.error(message);
    },
  });
}
