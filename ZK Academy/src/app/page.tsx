'use client'

import { useAppStore, type ViewId } from '@/lib/store'
import { AnimatePresence, motion } from 'framer-motion'
import Navigation from '@/components/Navigation'
import HeroSection from '@/components/HeroSection'
import RoadmapSection from '@/components/RoadmapSection'
import LessonViewer from '@/components/LessonViewer'
import PlaygroundSection from '@/components/PlaygroundSection'
import CircuitBuilderSection from '@/components/CircuitBuilderSection'
import VisualizerShell from '@/components/visualizers/VisualizerShell'
import SandboxSection from '@/components/SandboxSection'
import ProfileSection from '@/components/ProfileSection'
import AITutorPanel from '@/components/AITutorPanel'
import { useEffect } from 'react'

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
}

const pageTransition = {
  type: 'tween' as const,
  ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
  duration: 0.3,
}

function ViewRenderer({ view }: { view: ViewId }) {
  switch (view) {
    case 'home':
      return <HeroSection />
    case 'roadmap':
      return <RoadmapSection />
    case 'lesson':
      return <LessonViewer />
    case 'playground':
      return <PlaygroundSection />
    case 'circuit-builder':
      return <CircuitBuilderSection />
    case 'visualizer':
      return <VisualizerShell />
    case 'sandbox':
      return <SandboxSection />
    case 'profile':
      return <ProfileSection />
    case 'tutor':
      return <AITutorPanel />
    default:
      return <HeroSection />
  }
}

export default function Home() {
  const currentView = useAppStore((s) => s.currentView)
  const updateStreak = useAppStore((s) => s.updateStreak)

  // Update streak on app load
  useEffect(() => {
    updateStreak()
  }, [updateStreak])

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />

      <main className="flex-1 pt-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
            className="min-h-[calc(100vh-4rem)]"
          >
            <ViewRenderer view={currentView} />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* AI Tutor - always available */}
      <AITutorPanel />

      {/* Command Palette */}
      <CommandPalette />
    </div>
  )
}

function CommandPalette() {
  const open = useAppStore((s) => s.commandPaletteOpen)
  const toggle = useAppStore((s) => s.toggleCommandPalette)
  const setView = useAppStore((s) => s.setView)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        toggle()
      }
      if (e.key === 'Escape' && open) {
        toggle()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, toggle])

  const commands = [
    { id: 'home', label: 'Go to Home', view: 'home' as ViewId, shortcut: '' },
    { id: 'roadmap', label: 'Go to Roadmap', view: 'roadmap' as ViewId, shortcut: '' },
    { id: 'playground', label: 'Open Playground', view: 'playground' as ViewId, shortcut: '' },
    { id: 'circuit-builder', label: 'Open Circuit Builder', view: 'circuit-builder' as ViewId, shortcut: '' },
    { id: 'visualizer', label: 'Open Visualizations', view: 'visualizer' as ViewId, shortcut: '' },
    { id: 'sandbox', label: 'Open ZK Sandbox', view: 'sandbox' as ViewId, shortcut: '' },
    { id: 'profile', label: 'View Profile', view: 'profile' as ViewId, shortcut: '' },
  ]

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh]">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={toggle}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -10 }}
        transition={{ duration: 0.15 }}
        className="relative z-10 w-full max-w-lg rounded-xl border border-border bg-card shadow-2xl overflow-hidden"
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="text-sm text-muted-foreground">Type a command...</span>
          <kbd className="ml-auto text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">ESC</kbd>
        </div>
        <div className="max-h-72 overflow-y-auto p-2">
          {commands.map((cmd) => (
            <button
              key={cmd.id}
              onClick={() => {
                setView(cmd.view)
                toggle()
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-foreground hover:bg-accent transition-colors text-left"
            >
              <span className="text-muted-foreground">
                {cmd.id === 'home' && '~'}
                {cmd.id === 'roadmap' && '>'}
                {cmd.id === 'playground' && '{ }'}
                {cmd.id === 'circuit-builder' && '[ ]'}
                {cmd.id === 'visualizer' && '#'}
                {cmd.id === 'sandbox' && '$'}
                {cmd.id === 'profile' && '@'}
              </span>
              {cmd.label}
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
