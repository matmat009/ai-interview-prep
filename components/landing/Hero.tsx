import Link from "next/link";

import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.68 0-1.25.45-2.28 1.19-3.08-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.8 1.19 1.83 1.19 3.08 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.06.78 2.14 0 1.55-.01 2.79-.01 3.17 0 .31.21.68.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5Z" />
    </svg>
  );
}

export function Hero() {
  return (
    <section className="relative z-10 flex flex-col items-center px-6 pt-20 text-center sm:pt-28">
      <a
        href="#"
        className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] py-1 pr-2 pl-3 text-xs text-white/60 transition-colors hover:bg-white/[0.07]"
      >
        <span>AI mock interviews are now live!</span>
        <span className="flex items-center gap-0.5 font-medium text-white">
          Read more
          <ArrowRight className="size-3" />
        </span>
      </a>

      <h1 className="max-w-4xl bg-gradient-to-b from-white to-white/40 bg-clip-text text-5xl leading-[0.95] font-semibold tracking-tight text-transparent text-balance sm:text-7xl lg:text-[5.25rem]">
        Ace every interview with AI on your side
      </h1>

      <p className="mt-7 max-w-xl text-base text-white/50 sm:text-lg text-balance">
        AI interview prep that runs realistic mock interviews, scores your
        answers in real time, and coaches you to your next offer.
      </p>

      <div className="mt-10 flex items-center gap-3">
        <Button
          size="lg"
          className="px-5"
          nativeButton={false}
          render={<Link href="/signup" />}
        >
          Get started
        </Button>
        <Button variant="secondary" size="lg" className="px-5">
          <GithubIcon className="size-4" />
          Github
        </Button>
      </div>
    </section>
  );
}
