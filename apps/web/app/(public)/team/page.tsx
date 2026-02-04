'use client'

import TeamHero from '@/components/team/teamHero'
import TeamPhilosophyAbstract from '@/components/team/TeamPhilosophyAbstract'
import TeamLeaderShowcase from '@/components/team/TeamLeaderShowcase'
import TeamInteractiveList from '@/components/team/TeamInteractiveList'
import TeamTransition from '@/components/team/TeamTransition'
import { teamMembers } from '@/components/data/teamData'
import TeamBackgroundElements from '@/components/team/decorative/TeamBackgroundElements'
import TeamClosingStatement from '@/components/team/teamClosingStatement'

// Mock data for the recognition section to match the "rich" feel
const AWARDS = [
    { year: '2025', name: 'Legal 500 Asia Pacific', award: 'Top Tier Firm - Dispute Resolution' },
    { year: '2024', name: 'Chambers Global', award: 'Band 1 - Corporate & Commercial' },
    { year: '2024', name: 'Asian Legal Business', award: 'Employer of Choice' },
    { year: '2023', name: 'Pakistan Law Awards', award: 'Litigation Firm of the Year' },
];

const PUBLICATIONS = [
    { year: '2025', publication: 'Bloomberg Law', article: 'Energy Regulation in Emerging Markets' },
    { year: '2024', publication: 'The Law Reviews', article: 'International Arbitration: Pakistan Chapter' },
    { year: '2024', publication: 'Dawn News', article: 'Constitutional Rights & Corporate Responsibility' },
    { year: '2023', publication: 'Counsel Magazine', article: 'The Future of IP Law in South Asia' },
    { year: '2022', publication: 'Harvard Law Review', article: 'Comparative Analysis of Regulatory Frameworks' },
];

/**
 * Team Page - Redesigned for a "Posh & Rich" Aesthetic
 * Upscale Dark Theme with Accordion Interactions
 */
export default function TeamPage() {
    return (
        <div
            className="min-h-screen text-heritage-cream transition-colors duration-700 ease-in-out relative overflow-hidden"
            style={{ background: 'var(--wood-espresso)' }}
        >
            {/* Background Texture Elements */}
            <TeamBackgroundElements
                variant="cream"
                density="minimal"
                elements={['lines', 'dots']}
                className="opacity-10 fixed inset-0 pointer-events-none z-0"
            />

            {/* 1. Hero Section - Massive Typography & Background */}
            <TeamHero
                brandStatement="MEET THE TEAM BEHIND THE EXCELLENCE"
                subtitle=""
                backgroundImage="/our_team/Group_photo.webp"
                className="text-heritage-cream relative z-10"
            />

            {/* 1.5 Transition Thread */}
            <TeamTransition />

            {/* 1.75 Team Leader Showcase */}
            {teamMembers.filter(m => m.isPrimary).map(leader => (
                <div key={leader.id} className="relative z-20 mb-24 lg:mb-32">
                    <TeamLeaderShowcase leader={leader} />
                </div>
            ))}

            {/* 2. Team Interactive List - Dark Accordion Style */}
            <div className="relative z-20">
                <TeamInteractiveList members={teamMembers.filter(m => !m.isPrimary)} />
            </div>

            {/* 3. Philosophy Section - Abstract Layout */}
            <div className="relative pb-16">
                <TeamPhilosophyAbstract
                    title="Our Philosophy"
                    statement="At AR&CO, we take a collaborative approach. Whether we’re working in the studio or alongside our clients and partners, it’s this shared process that helps us create work that reflects both your vision and ours."
                    images={[
                        {
                            src: '/our_team/Shoaib_Razaq.webp',
                            alt: 'Team leadership'
                        },
                        {
                            src: '/our_team/javad_niazi.webp',
                            alt: 'Legal excellence'
                        },
                        {
                            src: '/our_team/komal_zahra.webp',
                            alt: 'Client focus'
                        }
                    ]}
                />
            </div>

            {/* 4. Recognition Section */}
            <section className="px-4 md:px-8 lg:px-16 mb-0 max-w-[1600px] mx-auto pb-24 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Left: Section Label & Intro */}
                    <div className="lg:col-span-3">
                        <div className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-heritage-gold mb-8">
                            (Recognition)
                        </div>
                        <p className="text-sm font-medium leading-relaxed mb-6 text-heritage-cream/80">
                            Awards and media recognition aren't the goal, but they remind us that thoughtful legal practice leaves a lasting impact.
                        </p>
                    </div>

                    {/* Right: Tables */}
                    <div className="lg:col-span-9">
                        {/* AWARDS TABLE */}
                        <div className="mb-16">
                            <div className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-heritage-gold mb-8">
                                (Awards)
                            </div>
                            <div className="border-t border-heritage-gold/20">
                                <div className="grid grid-cols-12 py-4 text-[10px] font-bold uppercase tracking-wider text-heritage-cream/40">
                                    <div className="col-span-2">Year</div>
                                    <div className="col-span-4">Organization</div>
                                    <div className="col-span-6">Award</div>
                                </div>
                                {AWARDS.map((item, i) => (
                                    <div key={i} className="grid grid-cols-12 py-6 border-t border-heritage-gold/10 text-sm font-medium group hover:bg-heritage-gold/5 transition-colors cursor-default">
                                        <div className="col-span-2 text-heritage-cream/60">{item.year}</div>
                                        <div className="col-span-4 text-heritage-cream">{item.name}</div>
                                        <div className="col-span-6 text-heritage-cream/80">{item.award}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* PUBLICATIONS TABLE */}
                        <div>
                            <div className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-heritage-gold mb-8">
                                (Publications)
                            </div>
                            <div className="border-t border-heritage-gold/20">
                                <div className="grid grid-cols-12 py-4 text-[10px] font-bold uppercase tracking-wider text-heritage-cream/40">
                                    <div className="col-span-2">Year</div>
                                    <div className="col-span-4">Publication</div>
                                    <div className="col-span-6">Article</div>
                                </div>
                                {PUBLICATIONS.map((pub, i) => (
                                    <div key={i} className="grid grid-cols-12 py-6 border-t border-heritage-gold/10 text-sm font-medium group hover:bg-heritage-gold/5 transition-colors cursor-default">
                                        <div className="col-span-2 text-heritage-cream/60">{pub.year}</div>
                                        <div className="col-span-4 text-heritage-cream">{pub.publication}</div>
                                        <div className="col-span-6 text-heritage-cream/80">{pub.article}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. Closing Statement */}
            <TeamClosingStatement
                statement={`FOCUSED ON QUALITY\nDRIVEN BY EXCELLENCE`}
                subtext="Building lasting relationships through legal excellence"
                className="z-10 relative"
            />
        </div>
    )
}
