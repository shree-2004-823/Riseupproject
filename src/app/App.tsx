import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { FeaturesSection } from './components/FeaturesSection';
import { HowItWorksSection } from './components/HowItWorksSection';
import { AICoachSection } from './components/AICoachSection';
import { ProgressSection } from './components/ProgressSection';
import { ScenarioSection } from './components/ScenarioSection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { CTASection } from './components/CTASection';
import { Footer } from './components/Footer';
import { ChatbotButton } from './components/ChatbotButton';

export default function App() {
  return (
    <div className="relative bg-zinc-950 overflow-hidden">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <AICoachSection />
      <ProgressSection />
      <ScenarioSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
      <ChatbotButton />
    </div>
  );
}
