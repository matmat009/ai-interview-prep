import { OnboardingGradientBackground } from "@/features/onboarding/OnboardingGradientBackground";
import { OnboardingWizard } from "@/features/onboarding/OnboardingWizard";

export default function OnboardingPage() {
  return (
    <div className="relative flex min-h-svh items-center justify-center p-6">
      {/* Decorative blurred color wash (darker, animated onboarding variant). */}
      <OnboardingGradientBackground />
      {/* Foreground: the wizard sits above the gradient via z-10. Bounded to the
          viewport (up to 800px) so it never overflows horizontally on mobile. */}
      <div className="relative z-10 w-full max-w-[800px]">
        <OnboardingWizard />
      </div>
    </div>
  );
}
