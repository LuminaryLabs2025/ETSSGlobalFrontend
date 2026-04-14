import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { authService } from "@/services/auth.service";
import type { ApiError } from "@/types/api.types";

export function useResetPassword() {
  return useMutation({
    mutationFn: authService.resetPassword,
    onSuccess: () => {
      toast.success("Password reset successfully.");
    },
    onError: (error: AxiosError<ApiError>) => {
      const message =
        error.response?.data?.message ??
        "Failed to reset password. Please try again.";
      toast.error(message);
    },
  });
}
