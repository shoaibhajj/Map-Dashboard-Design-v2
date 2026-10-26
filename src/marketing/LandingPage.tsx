import { useLanguage } from '../contexts/LanguageContext'
import { LandingNav, LandingFooter } from './landing/LandingChrome'
import SignalStackHero from './landing/SignalStackHero'
import PacketDecoder from './landing/PacketDecoder'
import ContinuityLens from './landing/ContinuityLens'
import ModuleIndex from './landing/ModuleIndex'
import ClosingSection from './landing/ClosingSection'
import './landing/landing.css'

export default function LandingPage() {
  const { lang } = useLanguage()
  return (
    <div lang={lang} className="marketing-scope lp-root overflow-x-hidden bg-ground font-body text-text">
      <LandingNav />
      <main>
        <SignalStackHero />
        <PacketDecoder />
        <ContinuityLens />
        <ModuleIndex />
        <ClosingSection />
      </main>
      <LandingFooter />
    </div>
  )
}
