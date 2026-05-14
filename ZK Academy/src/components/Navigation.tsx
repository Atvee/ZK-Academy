'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import {
  Settings,
  Flame,
  Command,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const navItems = [
  { label: 'Learn', view: 'roadmap' as const },
  { label: 'Build', view: 'circuit-builder' as const },
  { label: 'Visualize', view: 'visualizer' as const },
  { label: 'Playground', view: 'playground' as const },
];

function XPProgressRing({ xp, level }: { xp: number; level: number }) {
  const xpInLevel = xp % 500;
  const progress = xpInLevel / 500;
  const radius = 14;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="relative flex items-center justify-center" title={`${xp} XP — Level ${level}`}>
      <svg width="36" height="36" viewBox="0 0 36 36" className="-rotate-90">
        <circle
          cx="18"
          cy="18"
          r={radius}
          fill="none"
          stroke="oklch(0.25 0.03 270)"
          strokeWidth="2.5"
        />
        <circle
          cx="18"
          cy="18"
          r={radius}
          fill="none"
          stroke="oklch(0.72 0.19 280)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <span className="absolute text-[10px] font-semibold text-primary">
        {level}
      </span>
    </div>
  );
}

export default function Navigation() {
  const { setView, userProgress, toggleCommandPalette, currentView } = useAppStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { xp, level, streak } = userProgress;

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 zk-glass">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between">
            {/* Left: Logo */}
            <motion.div
              className="flex items-center gap-2 cursor-pointer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setView('home')}
            >
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="font-mono text-sm font-bold tracking-wider zk-glow-text text-primary">
                ZK::Academy
              </span>
            </motion.div>

            {/* Center: Nav Items (desktop) */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = currentView === item.view;
                return (
                  <motion.button
                    key={item.view}
                    onClick={() => setView(item.view)}
                    className={`relative px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? 'text-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                    whileHover={{ y: -1 }}
                    whileTap={{ y: 0 }}
                  >
                    {item.label}
                    {isActive && (
                      <motion.div
                        layoutId="nav-active-indicator"
                        className="absolute inset-0 rounded-md bg-primary/10 border border-primary/20"
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Right: XP, Streak, CMD+K, Settings */}
            <div className="flex items-center gap-2">
              {/* Streak */}
              {streak > 0 && (
                <motion.div
                  className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-md bg-zk-surface border border-zk-border text-xs"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Flame className="h-3.5 w-3.5 text-zk-amber" />
                  <span className="font-medium text-foreground">{streak}</span>
                </motion.div>
              )}

              {/* XP Ring + Level */}
              <div className="hidden sm:flex items-center gap-1.5">
                <XPProgressRing xp={xp} level={level} />
                <span className="text-xs text-muted-foreground font-medium">
                  {xp} <span className="text-muted-foreground/60">XP</span>
                </span>
              </div>

              {/* Command Palette */}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={toggleCommandPalette}
                title="Command Palette (Ctrl+K)"
              >
                <Command className="h-3.5 w-3.5" />
              </Button>

              {/* Settings */}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground hidden sm:flex"
                title="Settings"
              >
                <Settings className="h-3.5 w-3.5" />
              </Button>

              {/* Mobile menu toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="h-4 w-4" />
                ) : (
                  <Menu className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="fixed inset-0 z-40 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Menu Panel */}
            <motion.div
              className="absolute top-14 left-0 right-0 zk-glass border-t border-zk-border/50"
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              <div className="px-4 py-3 space-y-1">
                {navItems.map((item, i) => {
                  const isActive = currentView === item.view;
                  return (
                    <motion.button
                      key={item.view}
                      onClick={() => {
                        setView(item.view);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                        isActive
                          ? 'text-primary bg-primary/10'
                          : 'text-muted-foreground hover:text-foreground hover:bg-zk-surface-hover'
                      }`}
                      initial={{ x: -10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      {item.label}
                    </motion.button>
                  );
                })}

                {/* Mobile-only: XP and Streak info */}
                <div className="flex items-center gap-3 pt-3 mt-2 border-t border-zk-border/50">
                  <div className="flex items-center gap-1.5">
                    <XPProgressRing xp={xp} level={level} />
                    <span className="text-xs text-muted-foreground font-medium">
                      Level {level} &middot; {xp} XP
                    </span>
                  </div>
                  {streak > 0 && (
                    <div className="flex items-center gap-1">
                      <Flame className="h-3.5 w-3.5 text-zk-amber" />
                      <span className="text-xs font-medium text-foreground">{streak} day streak</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
