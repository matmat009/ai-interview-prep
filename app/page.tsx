import { DashboardPreview } from "@/components/landing/DashboardPreview";
import { Hero } from "@/components/landing/Hero";
import { Navbar } from "@/components/landing/Navbar";

export default function Home() {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-hidden bg-[#0a0a0b]">
      <Navbar />
      <Hero />
      <DashboardPreview />
    </div>
  );
}
