
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Badge } from '../components/UI';

export const PrivacyPage: React.FC = () => {
    const navigate = useNavigate();

    const Section = ({ title, children, icon, delay = 0 }: { title: string; children?: React.ReactNode; icon: string; delay?: number }) => (
        <section className="space-y-4 animate-slide-up" style={{ animationDelay: `${delay}ms` }}>
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary transition-transform hover:scale-110">
                    <i className={`fa-solid fa-${icon}`}></i>
                </div>
                <h2 className="text-xl font-display font-black text-gray-900 dark:text-white uppercase tracking-tight">{title}</h2>
            </div>
            <div className="text-gray-600 dark:text-gray-400 leading-relaxed space-y-3 pl-1">
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
                <h1 className="text-xl font-bold font-display dark:text-white">Privacy Policy</h1>
            </div>

            <div className="max-w-3xl mx-auto px-5 py-10 space-y-16">
                
                {/* Introduction */}
                <header className="text-center space-y-4 animate-slide-up">
                    <Badge color="blue" className="mb-2">Effective: May 2024</Badge>
                    <h2 className="text-3xl font-display font-black text-gray-900 dark:text-white">Your Privacy at LYNQED</h2>
                    <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto font-medium">
                        LYNQED is committed to protecting your personal data. This policy explains how we collect, use, and safeguard your information.
                    </p>
                </header>

                <Card className="p-8 border-none shadow-soft bg-white dark:bg-darkSurface transition-all hover:shadow-xl duration-700">
                    <div className="space-y-12">
                        <Section title="Governance & Scope" icon="shield-halved" delay={100}>
                            <p>LYNQED is owned and operated by <strong>Liquid</strong>, the parent technology company. Liquid governs the data processed through LYNQED.</p>
                        </Section>

                        <Section title="Data Collection" icon="database" delay={200}>
                            <p>We collect data only when necessary to provide our services. The type of data collected depends on your role on the platform.</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                                <div className="p-4 bg-gray-50 dark:bg-darkBg rounded-2xl border border-gray-100 dark:border-gray-800">
                                    <h4 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                        <i className="fa-solid fa-bag-shopping text-primary"></i> Buyer Data
                                    </h4>
                                    <ul className="text-xs space-y-1 list-disc pl-4 opacity-80">
                                        <li>Full name, Email, and Phone number</li>
                                        <li>Campus location (hostel/building/address)</li>
                                    </ul>
                                </div>
                                <div className="p-4 bg-gray-50 dark:bg-darkBg rounded-2xl border border-gray-100 dark:border-gray-800">
                                    <h4 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                        <i className="fa-solid fa-store text-secondary"></i> Vendor Data
                                    </h4>
                                    <ul className="text-xs space-y-1 list-disc pl-4 opacity-80">
                                        <li>Store name, description, and listings</li>
                                        <li>Operational details and store location</li>
                                    </ul>
                                </div>
                            </div>
                        </Section>

                        <Section title="Security & Protection" icon="lock" delay={300}>
                            <p>LYNQED utilizes <strong>Supabase</strong> for its backend infrastructure, ensuring high-standard data security including HTTPS/TLS encryption and Row-Level Security (RLS).</p>
                        </Section>
                    </div>
                </Card>
            </div>
        </div>
    );
};