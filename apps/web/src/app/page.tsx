import { LandingHeader } from '@/components/landing/LandingHeader';
import { LandingHero } from '@/components/landing/LandingHero';
import { LandingAbout } from '@/components/landing/LandingAbout';
import { LandingFeatures } from '@/components/landing/LandingFeatures';
import { LandingServices } from '@/components/landing/LandingServices';
import { LandingPlans } from '@/components/landing/LandingPlans';
import { LandingTestimonials } from '@/components/landing/LandingTestimonials';
import { LandingFAQ } from '@/components/landing/LandingFAQ';
import { LandingFooter } from '@/components/landing/LandingFooter';

export default function HomePage() {
    return (
        <main className="min-h-screen bg-burgos-dark text-burgos-accent overflow-hidden font-sans selection:bg-burgos-primary selection:text-white">
            <LandingHeader />
            <LandingHero />
            <LandingAbout />
            <LandingFeatures />
            <LandingServices />
            <LandingPlans />
            <LandingTestimonials />
            <LandingFAQ />
            <LandingFooter />

            {/* Background Texture/Gradient */}
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-burgos-secondary/20 via-burgos-dark to-burgos-dark -z-10 pointer-events-none" />
        </main>
    );
}
