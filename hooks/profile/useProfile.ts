import { useQuery } from "@tanstack/react-query";
import { profileService } from "@/services/profile.service";

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: profileService.get,
  });
}
