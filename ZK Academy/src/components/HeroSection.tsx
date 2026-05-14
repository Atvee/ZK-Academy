'use client';

import { motion } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { ChevronDown, ArrowRight, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';

/* ── Animated Network SVG Background ── */
function NetworkBackground() {
  const nodes = [
    { cx: 80, cy: 60, r: 2.5, delay: 0 },
    { cx: 200, cy: 120, r: 2, delay: 0.5 },
    { cx: 340, cy: 80, r: 3, delay: 1 },
    { cx: 480, cy: 140, r: 2, delay: 0.3 },
    { cx: 620, cy: 60, r: 2.5, delay: 0.8 },
    { cx: 760, cy: 100, r: 2, delay: 1.2 },
    { cx: 900, cy: 70, r: 3, delay: 0.6 },
    { cx: 1060, cy: 120, r: 2.5, delay: 0.9 },
    { cx: 1200, cy: 80, r: 2, delay: 0.4 },
    { cx: 150, cy: 240, r: 2, delay: 1.1 },
    { cx: 300, cy: 280, r: 3, delay: 0.7 },
    { cx: 500, cy: 250, r: 2.5, delay: 0.2 },
    { cx: 680, cy: 300, r: 2, delay: 1.3 },
    { cx: 850, cy: 260, r: 2.5, delay: 0.5 },
    { cx: 1020, cy: 290, r: 2, delay: 0.9 },
    { cx: 1180, cy: 240, r: 3, delay: 0.1 },
    { cx: 130, cy: 420, r: 2.5, delay: 0.6 },
    { cx: 290, cy: 460, r: 2, delay: 1.0 },
    { cx: 460, cy: 430, r: 3, delay: 0.4 },
    { cx: 640, cy: 480, r: 2.5, delay: 0.8 },
    { cx: 810, cy: 440, r: 2, delay: 1.2 },
    { cx: 980, cy: 470, r: 2.5, delay: 0.3 },
    { cx: 1130, cy: 420, r: 2, delay: 0.7 },
    { cx: 60, cy: 580, r: 2, delay: 1.1 },
    { cx: 220, cy: 620, r: 3, delay: 0.5 },
    { cx: 400, cy: 590, r: 2.5, delay: 0.9 },
    { cx: 570, cy: 640, r: 2, delay: 0.2 },
    { cx: 750, cy: 600, r: 2.5, delay: 1.0 },
    { cx: 920, cy: 630, r: 2, delay: 0.6 },
    { cx: 1090, cy: 580, r: 3, delay: 0.4 },
    { cx: 170, cy: 750, r: 2.5, delay: 0.7 },
    { cx: 350, cy: 780, r: 2, delay: 1.1 },
    { cx: 530, cy: 740, r: 2.5, delay: 0.3 },
    { cx: 700, cy: 790, r: 3, delay: 0.8 },
    { cx: 880, cy: 760, r: 2, delay: 0.5 },
    { cx: 1050, cy: 800, r: 2.5, delay: 1.2 },
    { cx: 1190, cy: 750, r: 2, delay: 0.1 },
  ];

  const connections = [
    [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8],
    [0, 9], [1, 10], [2, 11], [3, 12], [4, 13], [5, 14], [6, 15], [7, 15],
    [9, 10], [10, 11], [11, 12], [12, 13], [13, 14], [14, 15],
    [9, 16], [10, 17], [11, 18], [12, 19], [13, 20], [14, 21], [15, 22],
    [16, 17], [17, 18], [18, 19], [19, 20], [20, 21], [21, 22],
    [16, 23], [17, 24], [18, 25], [19, 26], [20, 27], [21, 28], [22, 29],
    [23, 24], [24, 25], [25, 26], [26, 27], [27, 28], [28, 29],
    [23, 30], [24, 31], [25, 32], [26, 33], [27, 34], [28, 35], [29, 36],
    [30, 31], [31, 32], [32, 33], [33, 34], [34, 35], [35, 36],
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background/80" />

      <svg
        className="absolute inset-0 w-full h-full opacity-30"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
        viewBox="0 0 1280 900"
      >
        <defs>
          <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="oklch(0.72 0.19 280)" stopOpacity="0.8" />
            <stop offset="100%" stopColor="oklch(0.72 0.19 280)" stopOpacity="0" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Connection lines */}
        {connections.map(([from, to], i) => (
          <line
            key={`conn-${i}`}
            x1={nodes[from].cx}
            y1={nodes[from].cy}
            x2={nodes[to].cx}
            y2={nodes[to].cy}
            stroke="oklch(0.72 0.19 280)"
            strokeWidth="0.5"
            strokeOpacity="0.25"
            className="zk-connection-line"
            style={{ animationDelay: `${i * 0.08}s` }}
          />
        ))}

        {/* Nodes */}
        {nodes.map((node, i) => (
          <g key={`node-${i}`}>
            {/* Glow halo */}
            <circle
              cx={node.cx}
              cy={node.cy}
              r={node.r * 4}
              fill="url(#nodeGlow)"
              opacity="0.15"
            >
              <animate
                attributeName="opacity"
                values="0.1;0.25;0.1"
                dur={`${2.5 + node.delay}s`}
                repeatCount="indefinite"
                begin={`${node.delay}s`}
              />
            </circle>
            {/* Core dot */}
            <circle
              cx={node.cx}
              cy={node.cy}
              r={node.r}
              fill="oklch(0.72 0.19 280)"
              filter="url(#glow)"
              opacity="0.6"
            >
              <animate
                attributeName="opacity"
                values="0.4;0.9;0.4"
                dur={`${3 + node.delay * 0.5}s`}
                repeatCount="indefinite"
                begin={`${node.delay}s`}
              />
              <animate
                attributeName="r"
                values={`${node.r};${node.r * 1.3};${node.r}`}
                dur={`${3 + node.delay * 0.5}s`}
                repeatCount="indefinite"
                begin={`${node.delay}s`}
              />
            </circle>
          </g>
        ))}
      </svg>

      {/* Subtle gradient at bottom for fade-out effect */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
}

/* ── Stagger animation helpers ── */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  },
};

/* ── Stats data ── */
const stats = [
  { label: '6 Levels', accent: false },
  { label: '50+ Lessons', accent: false },
  { label: 'Interactive Visualizations', accent: false },
  { label: 'AI-Powered', accent: true },
];

/* ── Hero Section ── */
export default function HeroSection() {
  const setView = useAppStore((s) => s.setView);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Animated network background */}
      <NetworkBackground />

      {/* Content */}
      <motion.div
        className="relative z-10 flex flex-col items-center text-center px-4 sm:px-6 max-w-3xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Badge */}
        <motion.div variants={itemVariants}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zk-border bg-zk-surface/50 text-xs font-medium text-muted-foreground mb-8">
            <Terminal className="h-3 w-3 text-primary" />
            <span>INTERACTIVE ZK EDUCATION</span>
          </div>
        </motion.div>

        {/* Heading */}
        <motion.h1
          variants={itemVariants}
          className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6"
        >
          <span className="bg-gradient-to-r from-primary via-zk-violet to-zk-cyan bg-clip-text text-transparent">
            Master Zero Knowledge
          </span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          variants={itemVariants}
          className="text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed mb-10"
        >
          From first principles to production systems. The most comprehensive
          interactive platform for learning ZK proofs and Web3 cryptography.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-center gap-3 mb-12"
        >
          <Button
            onClick={() => setView('roadmap')}
            className="group relative h-11 px-6 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 zk-glow"
            size="default"
          >
            Begin Your Journey
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Button>

          <Button
            onClick={() => setView('playground')}
            variant="outline"
            className="h-11 px-6 font-medium rounded-lg border-zk-border text-foreground hover:bg-zk-surface-hover hover:text-foreground"
            size="default"
          >
            Explore Playground
          </Button>
        </motion.div>

        {/* Stats row */}
        <motion.div
          variants={itemVariants}
          className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs sm:text-sm text-muted-foreground"
        >
          {stats.map((stat, i) => (
            <span key={stat.label} className="flex items-center gap-1.5">
              {i > 0 && (
                <span className="hidden sm:inline text-zk-border">|</span>
              )}
              <span
                className={
                  stat.accent
                    ? 'text-primary font-medium'
                    : ''
                }
              >
                {stat.label}
              </span>
            </span>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
      >
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground/50 font-medium">
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown className="h-4 w-4 text-muted-foreground/40" />
        </motion.div>
      </motion.div>
    </section>
  );
}
