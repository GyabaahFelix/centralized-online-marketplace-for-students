
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Badge } from '../components/UI';

interface FAQItemProps {
    question: string;
    answer: React.ReactNode;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-b border-gray-100 dark:border-gray-800 last:border-0 overflow-hidden transition-all duration-300">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full py-5 flex items-center justify-between text-left group transition-all"
            >
                <span className={`text-sm md:text-base font-bold transition-colors duration-300 ${isOpen ? 'text-primary' : 'text-gray-700 dark:text-gray-300'}`}>
                    {question}
                </span>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${isOpen ? 'bg-primary text-white rotate-180 shadow-glow' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                    <i className="fa-solid fa-chevron-down text-[10px]"></i>
                </div>
            </button>
            <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isOpen ? 'max-h-96 opacity-100 pb-5' : 'max-h-0 opacity-0'}`}>
                <div className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed pr-8 animate-fade-in">
                    {answer}
                </div>
            </div>
        </div>
    );
};

const FAQSection = ({ title, icon, children, delay = 0 }: { title: string; icon: string; children?: React.ReactNode; delay?: number }) => (
    <div className="space-y-4 animate-slide-up" style={{ animationDelay: `${delay}ms` }}>
        <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary transition-transform hover:scale-110">
                <i className={`fa-solid fa-${icon} text-sm`}></i>
            </div>
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">{title}</h3>
        </div>
        <Card className="px-6 border-gray-100 dark:border-gray-800 bg-white dark:bg-darkSurface shadow-soft hover:shadow-lg transition-all">
            {children}
        </Card>
    </div>
);

export const FAQPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-transparent pb-24 animate-fade-in font-sans">
            {/* Header */}
            <div className="bg-white/80 dark:bg-darkSurface/80 backdrop-blur-md p-4 shadow-sm sticky top-0 z-30 flex items-center gap-3 border-b border-gray-100 dark:border-gray-800">
                <button onClick={() => navigate(-1)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-white transition-colors">
                    <i className="fa-solid fa-arrow-left"></i>
                </button>
                <h1 className="text-xl font-bold font-display dark:text-white">Help Center</h1>
            </div>

            <div className="max-w-3xl mx-auto px-5 py-10 space-y-12">
                
                {/* Introduction */}
                <header className="text-center space-y-4 mb-8 animate-slide-up">
                    <Badge color="violet" className="mb-2">Support & Knowledge</Badge>
                    <h2 className="text-3xl font-display font-black text-gray-900 dark:text-white">Frequently Asked Questions</h2>
                    <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto font-medium">
                        Find quick answers to common questions about LYNQED and how our ecosystem works.
                    </p>
                </header>

                <div className="space-y-10">
                    <FAQSection title="General" icon="circle-info" delay={100}>
                        <FAQItem 
                            question="What is LYNQED?" 
                            answer="LYNQED is a location-based marketplace built for student and campus communities. It bridges the gap between buyers, vendors, and delivery personnel within the same vicinity. LYNQED is a product developed and managed by Liquid, a parent technology company." 
                        />
                        <FAQItem 
                            question="Is LYNQED a standalone company?" 
                            answer="No. LYNQED is a specialized product owned and operated by Liquid. Liquid provides the technical infrastructure, governance, and management for the platform." 
                        />
                    </FAQSection>

                    <FAQSection title="Vendors & Deliveries" icon="truck-fast" delay={300}>
                        <FAQItem 
                            question="Who manages the platform integrity?" 
                            answer="Liquid Technology's operations team vets all merchant applications to ensure quality and reliability within the campus ecosystem." 
                        />
                    </FAQSection>

                    <FAQSection title="Support" icon="headset" delay={500}>
                        <div className="py-6 text-center space-y-4">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Still have questions?</p>
                            <a href="mailto:support@lynqed.shop" className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-bold text-sm hover:scale-105 transition-transform active:scale-95 shadow-lg shadow-primary/20">
                                <i className="fa-solid fa-envelope"></i>
                                support@lynqed.shop
                            </a>
                            <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-800">
                                <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] animate-pulse">Powered by Liquid Engineering</p>
                            </div>
                        </div>
                    </FAQSection>
                </div>
            </div>
        </div>
    );
};