import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";
import type { ApiError } from "@/types/api.types";

export function useVerifyOtp() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const temporaryToken = useAuthStore((s) => s.temporaryToken);
  const clearPending2FA = useAuthStore((s) => s.clearPending2FA);

  return useMutation({
    mutationFn: async (code: string) =>
      authService.verify2FA({ temporary_token: temporaryToken!, code }),
    onSuccess: (response) => {
      const { user, access_token } = response;
      
      // Complete the login
      setAuth(user, access_token);
      clearPending2FA();
      
      toast.success(`Welcome back, ${user.first_name}`);
      router.push("/dashboard");
    },
    onError: (error: AxiosError<ApiError>) => {
      const message =
        error.response?.data?.message ??
        "Verification failed. Please try again.";
      toast.error(message);
    },
  });
}
