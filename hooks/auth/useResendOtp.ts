import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { authService } from "@/services/auth.service";
import type { ApiError } from "@/types/api.types";
import type { OtpMethod } from "@/types/auth.types";

export function useResendOtp() {
  return useMutation({
    mutationFn: async (method: OtpMethod) =>
      authService.resendOtp({ method }),
    onSuccess: (response, method) => {
      const methodLabel =
        method === "authenticator" ? "authenticator app" : method;
      toast.success(`OTP resent to your ${methodLabel}`);
    },
    onError: (error: AxiosError<ApiError>) => {
      const message =
        error.response?.data?.message ??
        "Failed to resend OTP. Please try again.";
      toast.error(message);
    },
  });
}
