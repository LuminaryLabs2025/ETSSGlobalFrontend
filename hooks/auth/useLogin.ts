import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";
import type { ApiError } from "@/types/api.types";

export function useLogin() {
  const router = useRouter();
  const setPending2FA = useAuthStore((s) => s.setPending2FA);

  return useMutation({
    mutationFn: authService.login,
    onSuccess: (response) => {
      const { temporary_token, message, two_factor_method } = response;

      // Store temporary token and method for 2FA verification
      setPending2FA(temporary_token, two_factor_method);
      toast.info(message || "2FA verification required");
      router.push("/two-factor");
    },
    onError: (error: AxiosError<ApiError>) => {
      const message =
        error.response?.data?.message ?? "Login failed. Please try again.";
      toast.error(message);
    },
  });
}
