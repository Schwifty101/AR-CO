'use client'

import TeamHero from '@/components/team/teamHero'
import TeamPhilosophy from '@/components/team/teamPhilosophy'
import TeamSectionHeader from '@/components/team/teamSectionHeader'
import TeamMemberList from '@/components/team/teamMemberList'
import TeamShowcase from '@/components/team/teamShowcase'
import TeamClosingStatement from '@/components/team/teamClosingStatement'
import Footer from '@/components/footer/Footer'
import { teamMembersExtended } from './teamData'

/**
 * Team Page - OH Architecture Inspired Design
 *
 * Features:
 * - Massive typography hero section
 * - Philosophy statement with image grid
 * - Editorial list-based team presentation
 * - Awards and recognition showcase
 * - Bold closing statement
 *
 * Design Philosophy:
 * - Typography-forward layout
 * - Generous whitespace
 * - Scroll-triggered animations
 * - Minimalist color palette (heritage cream + walnut + gold)
 */
export default function TeamPage() {
  return (
    <div
      className="min-h-screen"
      style={{ background: 'var(--heritage-cream)' }}
    >
      {/* 1. Hero Section - Massive Brand Statement */}
      <TeamHero
        brandStatement="THE TEAM"
        subtitle="Excellence Rooted in Expertise"
        backgroundImage="/our_team/Group_photo.webp"
      />

      {/* 2. Philosophy Section - Mission + Image Grid */}
      <TeamPhilosophy
        title="Our Philosophy"
        statement="At AR&CO, we believe that exceptional legal counsel stems from deep expertise, unwavering integrity, and a commitment to understanding our clients' unique challenges. Our team combines decades of experience with innovative approaches to solve complex legal matters across corporate law, intellectual property, taxation, and litigation."
        images={[
          {
            src: '/our_team/Shoaib_Razaq.webp',
            alt: 'Team leadership and expertise'
          },
          {
            src: '/our_team/javad_niazi.webp',
            alt: 'Legal excellence in practice'
          },
          {
            src: '/our_team/komal_zahra.webp',
            alt: 'Client-focused approach'
          }
        ]}
      />

      {/* 3. Team Section - Bold Header + List Presentation */}
      <section className="py-16 md:py-32" style={{ background: '#FFFFFF' }}>
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 lg:px-16 mb-12">
          <p
            className="text-xs md:text-sm uppercase tracking-widest mb-8"
            style={{ color: 'var(--heritage-gold)', fontWeight: 700 }}
          >
            02 — Leadership
          </p>
          <TeamSectionHeader
            text="MEET THE MINDS BEHIND THE EXCELLENCE"
            align="left"
            size="large"
          />
        </div>

        <TeamMemberList
          members={teamMembersExtended}
          layout="primary-first"
          showExpertise={true}
        />
      </section>

      {/* 4. Showcase Section - Recognition & Achievements */}
      <TeamShowcase
        title="25+ Years of Legal Excellence"
        items={[
          {
            title: '500+',
            description: 'Cases successfully resolved across all practice areas',
            year: '2024'
          },
          {
            title: 'Supreme Court',
            description: 'Admitted to practice before the Supreme Court of Pakistan',
            year: '2000'
          },
          {
            title: 'International Expertise',
            description:
              'Cross-border legal matters and international arbitration',
            year: '2015'
          },
          {
            title: 'NEPRA Recognition',
            description:
              'Former Director Legal at National Electric Power Regulatory Authority',
            year: '2018'
          },
          {
            title: 'IP Portfolio',
            description:
              'Leading expertise in intellectual property law and patent litigation',
            year: '2010'
          },
          {
            title: 'Client Trust',
            description:
              'Trusted by Fortune 500 companies and leading Pakistani enterprises',
            year: '2020'
          }
        ]}
        layout="grid"
      />

      {/* 5. Closing Statement - Bold Typography */}
      <TeamClosingStatement
        statement="Your Partner in Legal Excellence"
        subtext="Building lasting relationships through exceptional representation and unwavering commitment to our clients' success"
      />

      {/* Footer */}
      <Footer />
    </div>
  )
}
