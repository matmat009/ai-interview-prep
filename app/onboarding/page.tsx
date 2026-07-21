import { GradientBackground } from "@/components/layout/GradientBackground";
import { OnboardingWizard } from "@/features/onboarding/OnboardingWizard";

export default function OnboardingPage() {
  return (
    <div className="relative flex min-h-svh items-center justify-center p-6">
      {/* Decorative blurred color wash, behind the wizard card. */}
      <GradientBackground />
      {/* Foreground: the wizard sits above the gradient via z-10. */}
      <div className="relative z-10">
        <OnboardingWizard />
      </div>
    </div>
  );
}
