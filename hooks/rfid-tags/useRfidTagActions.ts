import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { rfidTagsService } from "@/services/rfid-tags.service";
import type { ApiError } from "@/types/api.types";
import type { RfidTagCreatePayload, RfidTagUpdatePayload } from "@/types/rfid-tags.types";

export function useCreateRfidTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RfidTagCreatePayload) => rfidTagsService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rfid-tags"] });
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to create RFID tag");
    },
  });
}

export function useUpdateRfidTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: RfidTagUpdatePayload }) =>
      rfidTagsService.update(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["rfid-tags"] });
      queryClient.invalidateQueries({ queryKey: ["rfid-tags", "detail", variables.id] });
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to update RFID tag");
    },
  });
}

export function useDeleteRfidTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: rfidTagsService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rfid-tags"] });
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to delete RFID tag");
    },
  });
}

export function useBulkUploadRfidTags() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => rfidTagsService.bulkUpload(file),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["rfid-tags"] });
      const imported = result.data?.imported;
      if (imported != null) {
        toast.success(`${imported} RFID tag(s) uploaded successfully.`);
      } else {
        toast.success(result.message ?? "RFID tags uploaded successfully.");
      }
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to upload RFID tags");
    },
  });
}
