
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Badge } from '../components/UI';

export const TermsPage: React.FC = () => {
    const navigate = useNavigate();

    const Section = ({ title, children, icon, delay = 0 }: { title: string; children?: React.ReactNode; icon: string; delay?: number }) => (
        <section className="space-y-4 animate-slide-up" style={{ animationDelay: `${delay}ms` }}>
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary transition-transform hover:scale-110">
                    <i className={`fa-solid fa-${icon}`}></i>
                </div>
                <h2 className="text-xl font-display font-black text-gray-900 dark:text-white uppercase tracking-tight">{title}</h2>
            </div>
            <div className="text-gray-600 dark:text-gray-400 leading-relaxed space-y-3 pl-1 text-sm md:text-base">
                {children}
            </div>
        </section>
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-darkBg pb-24 animate-fade-in font-sans">
            {/* Header */}
            <div className="bg-white dark:bg-darkSurface p-4 shadow-sm sticky top-0 z-30 flex items-center gap-3 border-b border-gray-100 dark:border-gray-800">
                <button onClick={() => navigate(-1)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-white transition-colors">
                    <i className="fa-solid fa-arrow-left"></i>
                </button>
                <h1 className="text-xl font-bold font-display dark:text-white">Terms & Conditions</h1>
            </div>

            <div className="max-w-3xl mx-auto px-5 py-10 space-y-16">
                
                {/* Introduction */}
                <header className="text-center space-y-4 animate-slide-up">
                    <Badge color="violet" className="mb-2">Last Updated: May 2024</Badge>
                    <h2 className="text-3xl font-display font-black text-gray-900 dark:text-white">The LYNQED Agreement</h2>
                    <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto font-medium">
                        Please read these terms carefully before using the platform. They govern your use of the LYNQED ecosystem.
                    </p>
                </header>

                <Card className="p-8 border-none shadow-soft bg-white dark:bg-darkSurface transition-all hover:shadow-xl duration-700">
                    <div className="space-y-12">
                        <Section title="Acceptance of Terms" icon="signature" delay={100}>
                            <p>By accessing or using LYNQED, you agree to be bound by these Terms and Conditions. If you do not agree to all of these terms, you must not access or use the platform.</p>
                        </Section>

                        <Section title="Platform Overview" icon="circle-nodes" delay={200}>
                            <p>LYNQED is a location-based marketplace designed for student and campus communities. It serves as a bridge connecting <strong>Buyers</strong>, <strong>Vendors</strong>, and <strong>Delivery Personnel</strong>.</p>
                        </Section>

                        <Section title="Limitation of Liability" icon="scale-balanced" delay={300}>
                            <p>Services are provided "as is" and "as available". Liquid does not guarantee uninterrupted access and is not liable for vendor product issues or user disputes.</p>
                        </Section>
                    </div>
                </Card>
            </div>
        </div>
    );
};