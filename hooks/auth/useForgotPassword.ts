import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { authService } from "@/services/auth.service";
import type { ApiError } from "@/types/api.types";

export function useForgotPassword() {
  return useMutation({
    mutationFn: authService.forgotPassword,
    onSuccess: () => {
      toast.success("Password reset link sent to your email.");
    },
    onError: (error: AxiosError<ApiError>) => {
      const message =
        error.response?.data?.message ??
        "Failed to send reset link. Please try again.";
      toast.error(message);
    },
  });
}
