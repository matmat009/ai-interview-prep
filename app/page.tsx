import { Hero } from "@/components/landing/Hero";
import { LandingGradientBackground } from "@/components/landing/LandingGradientBackground";
import { Navbar } from "@/components/landing/Navbar";

export default function Home() {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-hidden bg-[#0a0a0b]">
      {/* "Spectral Gradient (Darks)" — subtle ambient wash behind all content. */}
      <LandingGradientBackground />
      <Navbar />
      <Hero />
    </div>
  );
}
