import { InterviewProfileSection } from "@/features/settings/components/InterviewProfileSection";

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6 px-4 py-4 md:px-6 md:py-6">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
      <InterviewProfileSection />
    </div>
  );
}
