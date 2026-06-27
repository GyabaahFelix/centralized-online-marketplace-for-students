import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Badge, Avatar } from '../components/UI';

export const AboutPage: React.FC = () => {
    const navigate = useNavigate();

    const team = [
        {
            name: "Daniel Nti Awuku",
            role: "Chief Executive Officer(CEO)",
            bio: "Oversees product strategy and platform direction across Liquid’s ecosystem, focusing on solving local economic friction through scalable digital products.",
            img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80",
            contact: "danny@liquid.tech",
            phone: "0550332159"
        },
        {
            name: "Gyabaah Felix",
            role: "Chief Technology Officer(CTO)",
            bio: "Software Developer and Computer Scientist. Responsible for the architectural integrity and scalability of Liquid's products.",
            img: "https://suschmjoogvoufhozbet.supabase.co/storage/v1/object/public/lynqed-assets/team/felix.jpg",
            contact: "felixic360@gmail.com",
            phone: "0245402719"
        },
        {
            name: "Eunice Akligo",
            role: "Chief Operations Manager(COO)",
            bio: "Ensures smooth integration of platforms within communities and manages vendor relations across all products in the Liquid ecosystem.",
            img: "https://images.unsplash.com/photo-1567532939604-b6c5b0ad2e01?auto=format&fit=crop&w=400&q=80",
            contact: "eunice@liquid.tech",
            phone: "0545882745"
        }
    ];

    return (
        <div className="min-h-screen bg-transparent pb-32 animate-fade-in font-sans text-slate-800 dark:text-slate-200">
            {/* Header */}
            <div className="bg-white/80 dark:bg-darkSurface/80 backdrop-blur-md p-4 shadow-sm sticky top-0 z-30 flex items-center gap-3 border-b border-gray-100 dark:border-gray-800">
                <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-white transition-colors">
                    <i className="fa-solid fa-arrow-left"></i>
                </button>
                <h1 className="text-xl font-bold font-display dark:text-white">About Us</h1>
            </div>

            <div className="max-w-5xl mx-auto px-6 py-12 space-y-24">
                
                {/* SECTION 1: ABOUT LIQUID */}
                <section className="space-y-8 animate-slide-up">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-2.5 h-10 bg-primary rounded-full shadow-glow"></div>
                        <h2 className="text-4xl font-display font-black text-gray-900 dark:text-white uppercase tracking-tight">About Liquid</h2>
                    </div>
                    
                    <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                        Liquid is a technology powerhouse focused on building practical digital solutions that solve real-world problems in emerging and student-driven ecosystems.
                    </p>
                    
                    <div className="bg-white dark:bg-darkSurface p-10 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-soft relative overflow-hidden transform hover:shadow-xl transition-all duration-500">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                        <div className="relative z-10">
                            <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed mb-6">
                                Founded 3 years ago, Liquid was created with a simple belief: <strong className="text-primary font-bold">technology should be useful, accessible, and grounded in real human needs.</strong>
                            </p>
                            <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                                Liquid designs and builds platforms that connect people, simplify everyday processes, and unlock economic opportunities—with a strong focus on environments where traditional systems often fall short.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-gradient-to-br from-indigo-50 to-white dark:from-gray-800 dark:to-darkSurface p-8 rounded-3xl border border-indigo-100 dark:border-gray-700 shadow-sm hover:-translate-y-1 transition-transform">
                            <h3 className="font-bold text-primary mb-3 uppercase text-sm tracking-widest">Our Mission</h3>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">To create scalable digital products that empower communities, strengthen local economies, and remove friction from everyday interactions through engineering excellence.</p>
                        </div>
                        <div className="bg-gradient-to-br from-pink-50 to-white dark:from-gray-800 dark:to-darkSurface p-8 rounded-3xl border border-pink-100 dark:border-gray-700 shadow-sm hover:-translate-y-1 transition-transform">
                            <h3 className="font-bold text-secondary mb-3 uppercase text-sm tracking-widest">Our Vision</h3>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">A future where technology works quietly in the background to make life easier and commerce more accessible to every student and local vendor.</p>
                        </div>
                    </div>
                </section>

                {/* SECTION 2: MEET OUR TEAM */}
                <section className="space-y-16">
                    <div className="text-center space-y-4 animate-slide-up">
                        <Badge color="blue" className="px-4 py-1.5">The Leadership</Badge>
                        <h3 className="text-4xl font-display font-black text-gray-900 dark:text-white">Meet Our Team</h3>
                        <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">The visionaries and engineers driving Liquid and LYNQED forward.</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {team.map((member, idx) => (
                            <Card key={idx} 
                                  className="p-8 flex flex-col items-center text-center group hover:border-primary/30 transition-all border-gray-100 dark:border-gray-800 bg-white dark:bg-darkSurface shadow-card hover:shadow-float rounded-[3rem] animate-slide-up"
                                  style={{ animationDelay: `${(idx + 1) * 150}ms` }}
                            >
                                <div className="relative mb-8">
                                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <div className="w-48 h-48 rounded-full overflow-hidden border-8 border-white dark:border-darkBg shadow-xl relative z-10 transition-transform duration-500 group-hover:scale-105">
                                        <img src={member.img} alt={member.name} className="w-full h-full object-cover" />
                                    </div>
                                </div>

                                <h4 className="text-2xl font-display font-black text-gray-900 dark:text-white mb-2">{member.name}</h4>
                                <Badge color="violet" className="mb-6 font-black text-[10px] py-1 px-4">{member.role}</Badge>
                                
                                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-8 flex-grow">
                                    {member.bio}
                                </p>
                                
                                <div className="w-full pt-6 border-t border-gray-50 dark:border-gray-800 flex flex-col items-center gap-3">
                                    <a href={`mailto:${member.contact}`} className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-primary transition-colors">
                                        <i className="fa-solid fa-envelope text-[10px]"></i>
                                        <span className="underline">{member.contact}</span>
                                    </a>
                                    {member.phone && (
                                        <a href={`tel:${member.phone}`} className="flex items-center gap-2 text-xs font-black text-gray-900 dark:text-gray-200 bg-gray-50 dark:bg-gray-800 px-4 py-2 rounded-full hover:bg-primary hover:text-white transition-all">
                                            <i className="fa-solid fa-phone text-[10px]"></i> {member.phone}
                                        </a>
                                    )}
                                </div>
                            </Card>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};