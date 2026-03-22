// Server-rendered landing page — individual sections use 'use client' as needed

import LandingNav from '@/components/LandingNav'
import HeroSection from '@/components/landing/HeroSection'
import ProblemOutcomeSection from '@/components/landing/ProblemOutcomeSection'
import HowItWorksSection from '@/components/landing/HowItWorksSection'
import DemoSection from '@/components/landing/DemoSection'
import FeaturesSection from '@/components/landing/FeaturesSection'
import SecuritySection from '@/components/landing/SecuritySection'
import PricingSection from '@/components/landing/PricingSection'
import FaqSection from '@/components/FaqAccordion'
import FinalCTA from '@/components/landing/FinalCTA'
import Footer from '@/components/landing/Footer'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-main)] font-sans antialiased overflow-x-hidden">
      <LandingNav />
      <HeroSection />
      <ProblemOutcomeSection />
      <HowItWorksSection />
      <DemoSection />
      <FeaturesSection />
      <SecuritySection />
      <PricingSection />
      <FaqSection />
      <FinalCTA />
      <Footer />
    </div>
  )
}