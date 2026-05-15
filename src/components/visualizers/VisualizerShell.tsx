'use client'

import React, { useState, lazy, Suspense } from 'react'
import { motion } from 'framer-motion'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

const EllipticCurveViz = lazy(() => import('./EllipticCurveViz'))
const MerkleTreeViz = lazy(() => import('./MerkleTreeViz'))
const ModularArithmeticViz = lazy(() => import('./ModularArithmeticViz'))
const PolynomialViz = lazy(() => import('./PolynomialViz'))

interface VisualizerInfo {
  id: string
  title: string
  description: string
  color: string
  colorClass: string
  borderColor: string
  glowClass: string
  icon: React.ReactNode
  preview: React.ReactNode
}

const visualizers: VisualizerInfo[] = [
  {
    id: 'elliptic',
    title: 'Elliptic Curves',
    description: 'Visualize point addition & doubling on elliptic curves over ℝ and finite fields F_p',
    color: 'violet',
    colorClass: 'text-zk-violet',
    borderColor: 'border-zk-violet/30',
    glowClass: 'hover:shadow-[0_0_24px_rgba(167,139,250,0.15)]',
    icon: (
      <svg viewBox="0 0 40 40" className="w-5 h-5">
        <path
          d="M8 32 Q8 8 20 12 Q32 16 32 4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M8 32 Q8 56 20 28 Q32 0 32 36"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity={0.5}
        />
      </svg>
    ),
    preview: (
      <svg viewBox="0 0 200 100" className="w-full h-24">
        <path
          d="M30 50 Q30 15 100 30 Q170 45 170 10"
          fill="none"
          stroke="#a78bfa"
          strokeWidth="2"
          opacity={0.8}
        />
        <path
          d="M30 50 Q30 85 100 70 Q170 55 170 90"
          fill="none"
          stroke="#a78bfa"
          strokeWidth="2"
          opacity={0.5}
        />
        <circle cx="55" cy="35" r="3" fill="#22d3ee" />
        <circle cx="130" cy="22" r="3" fill="#22d3ee" />
        <line x1="55" y1="35" x2="130" y2="22" stroke="#22d3ee" strokeWidth="1" strokeDasharray="3 2" opacity={0.6} />
        <circle cx="100" cy="58" r="3" fill="#fbbf24" />
        <circle cx="100" cy="42" r="3.5" fill="#34d399">
          <animate attributeName="r" values="3;4;3" dur="2s" repeatCount="indefinite" />
        </circle>
      </svg>
    ),
  },
  {
    id: 'merkle',
    title: 'Merkle Trees',
    description: 'Build Merkle trees, generate proofs, and verify data integrity step by step',
    color: 'cyan',
    colorClass: 'text-zk-cyan',
    borderColor: 'border-zk-cyan/30',
    glowClass: 'hover:shadow-[0_0_24px_rgba(34,211,238,0.15)]',
    icon: (
      <svg viewBox="0 0 40 40" className="w-5 h-5">
        <circle cx="20" cy="6" r="3" fill="currentColor" opacity={0.8} />
        <circle cx="10" cy="20" r="2.5" fill="currentColor" opacity={0.6} />
        <circle cx="30" cy="20" r="2.5" fill="currentColor" opacity={0.6} />
        <circle cx="5" cy="34" r="2" fill="currentColor" opacity={0.4} />
        <circle cx="15" cy="34" r="2" fill="currentColor" opacity={0.4} />
        <circle cx="25" cy="34" r="2" fill="currentColor" opacity={0.4} />
        <circle cx="35" cy="34" r="2" fill="currentColor" opacity={0.4} />
        <line x1="20" y1="9" x2="10" y2="17" stroke="currentColor" strokeWidth="1" opacity={0.4} />
        <line x1="20" y1="9" x2="30" y2="17" stroke="currentColor" strokeWidth="1" opacity={0.4} />
        <line x1="10" y1="23" x2="5" y2="32" stroke="currentColor" strokeWidth="1" opacity={0.3} />
        <line x1="10" y1="23" x2="15" y2="32" stroke="currentColor" strokeWidth="1" opacity={0.3} />
        <line x1="30" y1="23" x2="25" y2="32" stroke="currentColor" strokeWidth="1" opacity={0.3} />
        <line x1="30" y1="23" x2="35" y2="32" stroke="currentColor" strokeWidth="1" opacity={0.3} />
      </svg>
    ),
    preview: (
      <svg viewBox="0 0 200 100" className="w-full h-24">
        <circle cx="100" cy="15" r="8" fill="rgba(167,139,250,0.2)" stroke="#a78bfa" strokeWidth="1.5">
          <animate attributeName="r" values="8;9;8" dur="3s" repeatCount="indefinite" />
        </circle>
        <circle cx="60" cy="45" r="6" fill="rgba(167,139,250,0.15)" stroke="#a78bfa" strokeWidth="1" />
        <circle cx="140" cy="45" r="6" fill="rgba(167,139,250,0.15)" stroke="#a78bfa" strokeWidth="1" />
        <circle cx="35" cy="75" r="5" fill="rgba(34,211,238,0.15)" stroke="#22d3ee" strokeWidth="1" />
        <circle cx="85" cy="75" r="5" fill="rgba(34,211,238,0.15)" stroke="#22d3ee" strokeWidth="1" />
        <circle cx="115" cy="75" r="5" fill="rgba(34,211,238,0.15)" stroke="#22d3ee" strokeWidth="1" />
        <circle cx="165" cy="75" r="5" fill="rgba(34,211,238,0.15)" stroke="#22d3ee" strokeWidth="1" />
        <line x1="100" y1="23" x2="60" y2="39" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        <line x1="100" y1="23" x2="140" y2="39" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        <line x1="60" y1="51" x2="35" y2="70" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        <line x1="60" y1="51" x2="85" y2="70" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        <line x1="140" y1="51" x2="115" y2="70" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        <line x1="140" y1="51" x2="165" y2="70" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        {/* Proof highlight */}
        <line x1="35" y1="75" x2="60" y2="51" stroke="#34d399" strokeWidth="1.5" opacity={0.6} />
        <line x1="60" y1="51" x2="100" y2="23" stroke="#34d399" strokeWidth="1.5" opacity={0.6} />
        <circle cx="85" cy="75" r="5" fill="rgba(251,191,36,0.2)" stroke="#fbbf24" strokeWidth="1" />
        <circle cx="140" cy="45" r="6" fill="rgba(251,191,36,0.2)" stroke="#fbbf24" strokeWidth="1" />
      </svg>
    ),
  },
  {
    id: 'modular',
    title: 'Modular Arithmetic',
    description: 'Explore addition and multiplication in Z_p with clock and table visualizations',
    color: 'emerald',
    colorClass: 'text-zk-emerald',
    borderColor: 'border-zk-emerald/30',
    glowClass: 'hover:shadow-[0_0_24px_rgba(52,211,153,0.15)]',
    icon: (
      <svg viewBox="0 0 40 40" className="w-5 h-5">
        <circle cx="20" cy="20" r="14" fill="none" stroke="currentColor" strokeWidth="2" opacity={0.6} />
        <circle cx="20" cy="8" r="2.5" fill="currentColor" opacity={0.8} />
        <circle cx="32" cy="20" r="2" fill="currentColor" opacity={0.5} />
        <circle cx="26" cy="32" r="2" fill="currentColor" opacity={0.5} />
        <circle cx="14" cy="32" r="2" fill="currentColor" opacity={0.5} />
        <circle cx="8" cy="20" r="2" fill="currentColor" opacity={0.5} />
        <line x1="20" y1="8" x2="32" y2="20" stroke="currentColor" strokeWidth="1" opacity={0.3} strokeDasharray="2 2" />
      </svg>
    ),
    preview: (
      <svg viewBox="0 0 200 100" className="w-full h-24">
        <circle cx="60" cy="50" r="38" fill="none" stroke="rgba(52,211,153,0.2)" strokeWidth="1" />
        {Array.from({ length: 7 }, (_, i) => {
          const angle = (2 * Math.PI * i) / 7 - Math.PI / 2
          const x = 60 + 30 * Math.cos(angle)
          const y = 50 + 30 * Math.sin(angle)
          return (
            <circle key={i} cx={x} cy={y} r="3" fill={i === 2 ? '#a78bfa' : i === 4 ? '#22d3ee' : 'rgba(255,255,255,0.3)'} />
          )
        })}
        {/* Table preview */}
        <g transform="translate(115, 12)">
          {Array.from({ length: 5 }, (_, i) =>
            Array.from({ length: 5 }, (_, j) => {
              const val = (i * j) % 7
              const hue = (val / 7) * 280
              return (
                <rect
                  key={`${i}-${j}`}
                  x={j * 14}
                  y={i * 14}
                  width="12"
                  height="12"
                  rx="2"
                  fill={`hsla(${hue}, 50%, 50%, 0.25)`}
                />
              )
            })
          )}
        </g>
      </svg>
    ),
  },
  {
    id: 'polynomial',
    title: 'Polynomials & Commitments',
    description: 'Interact with polynomial curves, evaluations, and commitment scheme visualization',
    color: 'amber',
    colorClass: 'text-zk-amber',
    borderColor: 'border-zk-amber/30',
    glowClass: 'hover:shadow-[0_0_24px_rgba(251,191,36,0.15)]',
    icon: (
      <svg viewBox="0 0 40 40" className="w-5 h-5">
        <path
          d="M5 30 Q12 5 20 15 Q28 25 35 10"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <line x1="20" y1="15" x2="20" y2="35" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" opacity={0.5} />
        <circle cx="20" cy="15" r="2.5" fill="currentColor" />
      </svg>
    ),
    preview: (
      <svg viewBox="0 0 200 100" className="w-full h-24">
        {/* Grid */}
        <line x1="20" y1="50" x2="180" y2="50" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        <line x1="100" y1="10" x2="100" y2="90" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        {/* Curve */}
        <path
          d="M20 70 Q50 10 80 50 Q110 90 140 30 Q160 -5 180 25"
          fill="none"
          stroke="#a78bfa"
          strokeWidth="2"
        />
        {/* Control points */}
        <circle cx="50" cy="30" r="3" fill="#a78bfa" opacity={0.6} />
        <circle cx="110" cy="70" r="3" fill="#a78bfa" opacity={0.6} />
        {/* Evaluation */}
        <line x1="140" y1="50" x2="140" y2="30" stroke="#22d3ee" strokeWidth="1" strokeDasharray="3 2" />
        <circle cx="140" cy="30" r="3.5" fill="#22d3ee">
          <animate attributeName="r" values="3;4;3" dur="2s" repeatCount="indefinite" />
        </circle>
        {/* Commitment hash */}
        <rect x="145" y="8" width="48" height="12" rx="3" fill="rgba(251,191,36,0.15)" stroke="#fbbf24" strokeWidth="0.5" />
        <text x="169" y="17" textAnchor="middle" fill="#fbbf24" fontSize="6" fontFamily="monospace">
          a3f8b2c1
        </text>
      </svg>
    ),
  },
]

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="flex flex-col items-center gap-3">
        <motion.div
          className="w-8 h-8 border-2 border-zk-violet border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
        <span className="text-sm text-muted-foreground">Loading visualizer...</span>
      </div>
    </div>
  )
}

export default function VisualizerShell() {
  const [activeViz, setActiveViz] = useState<string | null>(null)

  const activeInfo = visualizers.find((v) => v.id === activeViz)

  return (
    <section className="w-full max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-10"
      >
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">
          <span className="zk-glow-text text-zk-violet">Mathematical</span>{' '}
          <span className="text-foreground">Visualizations</span>
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
          Interactive tools for understanding the core mathematics behind zero-knowledge proofs
          and cryptographic protocols.
        </p>
      </motion.div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {visualizers.map((viz, idx) => (
          <motion.div
            key={viz.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.1 }}
          >
            <motion.div
              whileHover={{ y: -4, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Card
                className={`cursor-pointer bg-zk-surface ${viz.borderColor} ${viz.glowClass} transition-all duration-300 py-4`}
                onClick={() => setActiveViz(viz.id)}
              >
                <CardHeader className="pb-0">
                  <CardTitle className="flex items-center gap-2.5">
                    <span className={viz.colorClass}>{viz.icon}</span>
                    <span className={viz.colorClass}>{viz.title}</span>
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    {viz.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-center opacity-70 hover:opacity-100 transition-opacity">
                    {viz.preview}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* Full Visualizer Dialog */}
      <Dialog open={activeViz !== null} onOpenChange={(open) => !open && setActiveViz(null)}>
        <DialogContent className="max-w-[95vw] sm:max-w-[90vw] md:max-w-[900px] max-h-[90vh] overflow-y-auto bg-background border-zk-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {activeInfo?.icon}
              <span className={activeInfo?.colorClass}>{activeInfo?.title}</span>
            </DialogTitle>
            <DialogDescription>{activeInfo?.description}</DialogDescription>
          </DialogHeader>
          <div className="mt-2">
            <Suspense fallback={<LoadingFallback />}>
              {activeViz === 'elliptic' && <EllipticCurveViz />}
              {activeViz === 'merkle' && <MerkleTreeViz />}
              {activeViz === 'modular' && <ModularArithmeticViz />}
              {activeViz === 'polynomial' && <PolynomialViz />}
            </Suspense>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  )
}
