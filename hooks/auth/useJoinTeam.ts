import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { authService } from "@/services/auth.service";
import type { ApiError } from "@/types/api.types";

export function useJoinTeam() {
  const router = useRouter();

  return useMutation({
    mutationFn: authService.joinTeam,
    onSuccess: () => {
      toast.success("Account created successfully. Please sign in.");
      router.push("/");
    },
    onError: (error: AxiosError<ApiError>) => {
      const message =
        error.response?.data?.message ??
        "Failed to complete sign up. Please try again.";
      toast.error(message);
    },
  });
}
