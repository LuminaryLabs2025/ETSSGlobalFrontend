import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";
import type { ApiError } from "@/types/api.types";

export function useLogin() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const setPending2FA = useAuthStore((s) => s.setPending2FA);

  return useMutation({
    mutationFn: authService.login,
    onSuccess: (response) => {
      const { user, access_token } = response;

      // Check if 2FA is enabled
      if (user.two_factor_enabled) {
        // Store temporary auth data for 2FA verification
        setPending2FA(user.id, user.email);
        toast.info("Please verify your identity with two-factor authentication");
        router.push("/two-factor");
      } else {
        // Complete the login without 2FA
        setAuth(user, access_token);
        toast.success(`Welcome back, ${user.first_name}`);
        router.push("/dashboard");
      }
    },
    onError: (error: AxiosError<ApiError>) => {
      const message =
        error.response?.data?.message ?? "Login failed. Please try again.";
      toast.error(message);
    },
  });
}
