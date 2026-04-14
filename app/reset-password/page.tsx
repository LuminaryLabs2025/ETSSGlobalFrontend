import { Suspense } from "react";
import { ResetPasswordPage } from "@/components/auth/ResetPasswordPage";

export default function ResetPassword() {
  return (
    <Suspense>
      <ResetPasswordPage />
    </Suspense>
  );
}