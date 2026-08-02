import { Faq } from "@/components/landing/Faq";
import { Features } from "@/components/landing/Features";
import { Footer } from "@/components/landing/Footer";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { LandingGradientBackground } from "@/components/landing/LandingGradientBackground";
import { Navbar } from "@/components/landing/Navbar";

export default function Home() {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-hidden bg-[#0a0a0b]">
      {/* "Spectral Gradient (Darks)" — subtle ambient wash behind the hero. */}
      <LandingGradientBackground />
      <Navbar />
      <Hero />
      <HowItWorks />
      <Features />
      <Faq />
      {/* Closing footer hosts the bottom "Spectral Gradient (Darks)" wash. */}
      <Footer />
    </div>
  );
}
