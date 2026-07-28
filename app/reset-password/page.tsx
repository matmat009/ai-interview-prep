import { AuthShell } from "@/features/auth/AuthShell";
import { ResetPasswordForm } from "@/features/auth/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <AuthShell>
      <ResetPasswordForm />
    </AuthShell>
  );
}
