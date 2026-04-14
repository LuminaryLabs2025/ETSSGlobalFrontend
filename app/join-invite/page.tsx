import { Suspense } from "react";
import { InviteSignUpPage } from "@/components/auth/InviteSignUpPage";

export default function SignUp() {
  return (
    <Suspense>
      <InviteSignUpPage />
    </Suspense>
  );
}