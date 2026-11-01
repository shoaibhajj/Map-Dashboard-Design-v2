import "./replacement-landing.css"

import { useEffect } from "react"

import { HeaderSection } from "./sections/HeaderSection"

import { HeroSection } from "./sections/HeroSection"

import { ValueSection } from "./sections/ValueSection"

import { JourneySection } from "./sections/JourneySection"

import { LineageSection } from "./sections/LineageSection"

import { EventSection } from "./sections/EventSection"

import { PreviewSection } from "./sections/PreviewSection"

import { SensorsSection } from "./sections/SensorsSection"

import { CtaSection } from "./sections/CtaSection"

import { FooterSection } from "./sections/FooterSection"

export default function ReplacementLandingPage() {
  useEffect(() => {
    const hero = document.getElementById("hero")

    const frame = window.requestAnimationFrame(() => {
      hero?.classList.add("ready")

      hero?.classList.remove("pre")
    })

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches

    const observed = Array.from(
      document.querySelectorAll<HTMLElement>(".replacement-landing section"),
    )

    if (reduceMotion || !("IntersectionObserver" in window)) {
      observed.forEach((section) => section.classList.add("in"))
    } else {
      const observer = new IntersectionObserver(
        (entries) =>
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("in")

              observer.unobserve(entry.target)
            }
          }),
        { threshold: 0.12 },
      )

      observed.forEach((section) => observer.observe(section))

      return () => {
        window.cancelAnimationFrame(frame)

        observer.disconnect()
      }
    }

    return () => window.cancelAnimationFrame(frame)
  }, [])

  return (
    <main className="replacement-landing" lang="ar" dir="rtl">
      <HeaderSection />
      <HeroSection />
      <ValueSection />
      <JourneySection />
      <LineageSection />
      <EventSection />
      <PreviewSection />
      <SensorsSection />
      <CtaSection />
      <FooterSection />
    </main>
  )
}
