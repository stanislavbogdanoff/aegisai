'use client'

import { motion } from 'motion/react'
import { HeroSection } from '../components/ui/lamp'
import { FeaturesSectionDemo } from '../components/ui/cards'
import { FloatingNav } from '@/components/ui/floating-navbar'
import { Footer } from '@/components/footer'
import { ConceptShowcase } from '@/components/conceptshowcase'
import AIChatbot from '@/components/aegischatbot'

export default function Home() {
  const navItems = [
    { name: 'Try now', link: '/' },
    { name: 'Watch demo', link: '/docs' },
  ]

  return (
    <main className="w-full relative max-w-[1920px] bg-slate-950">
      <FloatingNav navItems={navItems} />
      <div className="h-screen w-full flex items-center justify-center gap-[20px]">
        <HeroSection />
      </div>
      <div className="h-screen w-full flex flex-col items-center justify-center">
        <AIChatbot />
      </div>
      <div className="h-screen flex flex-col items-center justify-center gap-[20px]">
        <motion.h3
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: 'easeInOut',
          }}
          className="bg-gradient-to-br from-slate-300 to-slate-500 py-4 bg-clip-text text-center text-4xl font-medium tracking-tight text-transparent md:text-9xl"
        >
          Explain. Fix. Learn.
        </motion.h3>
      </div>
      <div className="h-screen flex flex-col items-center justify-center gap-[50px]">
        <motion.h1
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: 'easeInOut',
          }}
          className="mt-8 bg-gradient-to-br from-slate-300 to-slate-400 py-4 bg-clip-text text-center text-3xl font-medium tracking-tight text-transparent md:text-6xl"
        >
          Shielding Your Code with Intelligence
        </motion.h1>

        <FeaturesSectionDemo />
      </div>
      <div className="h-screen flex flex-col items-center justify-center">
        <ConceptShowcase />
      </div>

      <Footer />
    </main>
  )
}
