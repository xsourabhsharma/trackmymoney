

import LandingNav from '@/components/LandingNav'
import HeroSection from '@/components/landing/HeroSection'
import ProblemOutcomeSection from '@/components/landing/ProblemOutcomeSection'
import HowItWorksSection from '@/components/landing/HowItWorksSection'
import FeaturesSection from '@/components/landing/FeaturesSection'
import ShowcaseSection from '@/components/landing/ShowcaseSection'
import SecuritySection from '@/components/landing/SecuritySection'
import FaqSection from '@/components/FaqAccordion'
import FinalCTA from '@/components/landing/FinalCTA'
import Footer from '@/components/landing/Footer'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-main)] font-sans antialiased">
      <LandingNav />
      <HeroSection />
      <ProblemOutcomeSection />
      <HowItWorksSection />
      <FeaturesSection />
      <ShowcaseSection />
      <SecuritySection />
      <FaqSection />
      <FinalCTA />
      <Footer />
    </div>
  )
}