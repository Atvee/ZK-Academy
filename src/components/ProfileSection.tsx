'use client'

import { useEffect, useState, useMemo, useSyncExternalStore } from 'react'
import { motion } from 'framer-motion'
import {
  Flame, BookOpen, Trophy, Lock, Zap, Shield, Cpu, Lightbulb,
  GraduationCap, Star, Award, Target,
} from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { allLevels } from '@/lib/curriculum'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

// ===== Achievement Definitions =====
interface AchievementDef {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  xpBonus: number
  category: 'learning' | 'building' | 'streak' | 'mastery' | 'special'
}

const ACHIEVEMENT_DEFS: AchievementDef[] = [
  {
    id: 'first-steps',
    title: 'First Steps',
    description: 'Complete your first lesson',
    icon: <Lightbulb className="w-5 h-5" />,
    xpBonus: 50,
    category: 'learning',
  },
  {
    id: 'crypto-initiate',
    title: 'Cryptography Initiate',
    description: 'Earn 50 cryptography skill points',
    icon: <Shield className="w-5 h-5" />,
    xpBonus: 100,
    category: 'learning',
  },
  {
    id: 'circuit-wrangler',
    title: 'Circuit Wrangler',
    description: 'Build your first circuit',
    icon: <Cpu className="w-5 h-5" />,
    xpBonus: 150,
    category: 'building',
  },
  {
    id: 'streak-starter',
    title: 'Streak Starter',
    description: 'Maintain a 3-day streak',
    icon: <Flame className="w-5 h-5" />,
    xpBonus: 75,
    category: 'streak',
  },
  {
    id: 'proof-generator',
    title: 'Proof Generator',
    description: 'Generate your first proof',
    icon: <Zap className="w-5 h-5" />,
    xpBonus: 200,
    category: 'building',
  },
  {
    id: 'zk-scholar',
    title: 'ZK Scholar',
    description: 'Complete Level 1',
    icon: <GraduationCap className="w-5 h-5" />,
    xpBonus: 300,
    category: 'mastery',
  },
  {
    id: 'snark-master',
    title: 'SNARK Master',
    description: 'Complete Level 3',
    icon: <Star className="w-5 h-5" />,
    xpBonus: 500,
    category: 'mastery',
  },
  {
    id: 'rollup-architect',
    title: 'Rollup Architect',
    description: 'Complete Level 6',
    icon: <Trophy className="w-5 h-5" />,
    xpBonus: 1000,
    category: 'mastery',
  },
  {
    id: 'math-explorer',
    title: 'Math Explorer',
    description: 'Use all visualizers',
    icon: <Target className="w-5 h-5" />,
    xpBonus: 150,
    category: 'special',
  },
  {
    id: 'consistency',
    title: 'Consistency',
    description: '7-day streak',
    icon: <Award className="w-5 h-5" />,
    xpBonus: 250,
    category: 'streak',
  },
]

const CATEGORY_COLORS: Record<string, string> = {
  learning: 'text-zk-cyan border-zk-cyan/30 bg-zk-cyan/10',
  building: 'text-zk-emerald border-zk-emerald/30 bg-zk-emerald/10',
  streak: 'text-zk-amber border-zk-amber/30 bg-zk-amber/10',
  mastery: 'text-zk-violet border-zk-violet/30 bg-zk-violet/10',
  special: 'text-zk-rose border-zk-rose/30 bg-zk-rose/10',
}

const CATEGORY_GLOW: Record<string, string> = {
  learning: 'shadow-[0_0_15px_rgba(6,182,212,0.15)]',
  building: 'shadow-[0_0_15px_rgba(16,185,129,0.15)]',
  streak: 'shadow-[0_0_15px_rgba(245,158,11,0.15)]',
  mastery: 'shadow-[0_0_15px_rgba(139,92,246,0.15)]',
  special: 'shadow-[0_0_15px_rgba(239,68,68,0.15)]',
}

// ===== Animated Counter =====
function AnimatedCounter({ target, duration = 1200 }: { target: number; duration?: number }) {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const startTime = Date.now()
    const startValue = 0

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCurrent(Math.round(startValue + (target - startValue) * eased))

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [target, duration])

  return <span>{current.toLocaleString()}</span>
}

// ===== Skill Radar Chart =====
function SkillRadarChart({ skillPoints }: { skillPoints: Record<string, number> }) {
  const skills = [
    { key: 'cryptography', label: 'Cryptography' },
    { key: 'mathematics', label: 'Mathematics' },
    { key: 'circuits', label: 'Circuits' },
    { key: 'protocols', label: 'Protocols' },
    { key: 'engineering', label: 'Engineering' },
    { key: 'applications', label: 'Applications' },
  ]

  const maxValue = 100
  const size = 240
  const center = size / 2
  const radius = 90
  const angleStep = (2 * Math.PI) / skills.length

  const points = skills.map((skill, i) => {
    const value = skillPoints[skill.key] || 0
    const normalized = Math.min(value / maxValue, 1)
    const angle = -Math.PI / 2 + i * angleStep
    const r = radius * normalized
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
      labelX: center + (radius + 24) * Math.cos(angle),
      labelY: center + (radius + 24) * Math.sin(angle),
      value,
      label: skill.label,
    }
  })

  const hexPoints = skills.map((_, i) => {
    const angle = -Math.PI / 2 + i * angleStep
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
    }
  })

  const hexPath = hexPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z'

  const gridLevels = [0.25, 0.5, 0.75, 1.0]
  const gridPaths = gridLevels.map(level => {
    const pts = skills.map((_, i) => {
      const angle = -Math.PI / 2 + i * angleStep
      return {
        x: center + radius * level * Math.cos(angle),
        y: center + radius * level * Math.sin(angle),
      }
    })
    return pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z'
  })

  const fillPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z'

  return (
    <div className="flex justify-center">
      <svg width={size + 80} height={size + 40} viewBox={`0 0 ${size + 80} ${size + 40}`}>
        <g transform={`translate(40, 20)`}>
          {/* Grid levels */}
          {gridPaths.map((path, i) => (
            <path
              key={i}
              d={path}
              fill="none"
              stroke="oklch(0.30 0.03 270)"
              strokeWidth={0.5}
              opacity={0.5}
            />
          ))}

          {/* Axis lines */}
          {hexPoints.map((point, i) => (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={point.x}
              y2={point.y}
              stroke="oklch(0.30 0.03 270)"
              strokeWidth={0.5}
              opacity={0.4}
            />
          ))}

          {/* Outer hexagon border */}
          <path d={hexPath} fill="none" stroke="oklch(0.35 0.03 270)" strokeWidth={1} />

          {/* Filled skill area */}
          <motion.path
            d={fillPath}
            fill="oklch(0.72 0.19 280 / 15%)"
            stroke="oklch(0.72 0.19 280)"
            strokeWidth={2}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            style={{ transformOrigin: `${center}px ${center}px` }}
          />

          {/* Data points */}
          {points.map((point, i) => (
            <motion.circle
              key={i}
              cx={point.x}
              cy={point.y}
              r={4}
              fill="oklch(0.72 0.19 280)"
              stroke="oklch(0.12 0.01 270)"
              strokeWidth={2}
              initial={{ r: 0 }}
              animate={{ r: 4 }}
              transition={{ duration: 0.3, delay: 0.5 + i * 0.08 }}
            />
          ))}

          {/* Labels */}
          {points.map((point, i) => (
            <text
              key={i}
              x={point.labelX}
              y={point.labelY}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-muted-foreground text-[10px] font-medium"
            >
              {point.label}
            </text>
          ))}
        </g>
      </svg>
    </div>
  )
}

// ===== XP Sparkline =====
function XPSparkline() {
  const xpData = useMemo(() => {
    const data: number[] = []
    let base = 45
    for (let i = 0; i < 7; i++) {
      const value = base + Math.floor(Math.random() * 80)
      data.push(value)
      base = value - Math.floor(Math.random() * 30)
    }
    return data
  }, [])

  const width = 280
  const height = 60
  const padding = 4
  const maxVal = Math.max(...xpData)
  const minVal = Math.min(...xpData)
  const range = maxVal - minVal || 1

  const points = xpData.map((val, i) => ({
    x: padding + (i / (xpData.length - 1)) * (width - padding * 2),
    y: padding + (1 - (val - minVal) / range) * (height - padding * 2),
  }))

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const areaPath = linePath + ` L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  return (
    <div>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="w-full">
        <defs>
          <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.72 0.19 280 / 30%)" />
            <stop offset="100%" stopColor="oklch(0.72 0.19 280 / 0%)" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#sparkGrad)" />
        <motion.path
          d={linePath}
          fill="none"
          stroke="oklch(0.72 0.19 280)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
        {points.map((p, i) => (
          <motion.circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={3}
            fill="oklch(0.72 0.19 280)"
            initial={{ r: 0 }}
            animate={{ r: 3 }}
            transition={{ delay: 0.3 + i * 0.1 }}
          />
        ))}
      </svg>
      <div className="flex justify-between mt-1 px-1">
        {days.map(day => (
          <span key={day} className="text-[9px] text-muted-foreground/50">{day}</span>
        ))}
      </div>
    </div>
  )
}

// ===== Level Progress Bar =====
function LevelProgressBar({ currentLevel }: { currentLevel: number }) {
  return (
    <div className="w-full">
      <div className="relative flex items-center justify-between">
        {/* Connecting line */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-border -translate-y-1/2" />
        <div
          className="absolute top-1/2 left-0 h-0.5 -translate-y-1/2 bg-zk-violet transition-all duration-500"
          style={{ width: `${((currentLevel - 1) / (allLevels.length - 1)) * 100}%` }}
        />

        {/* Level nodes */}
        {allLevels.map((level) => {
          const isCompleted = level.id < currentLevel
          const isCurrent = level.id === currentLevel
          const isFuture = level.id > currentLevel

          return (
            <div key={level.id} className="relative flex flex-col items-center z-10">
              <motion.div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                  isCompleted
                    ? 'border-zk-violet bg-zk-violet text-primary-foreground'
                    : isCurrent
                      ? 'border-zk-violet bg-zk-violet/20 text-zk-violet'
                      : 'border-border bg-background text-muted-foreground'
                }`}
                animate={
                  isCurrent
                    ? {
                        boxShadow: [
                          '0 0 0 0 oklch(0.72 0.19 280 / 0%)',
                          '0 0 0 8px oklch(0.72 0.19 280 / 15%)',
                          '0 0 0 0 oklch(0.72 0.19 280 / 0%)',
                        ],
                      }
                    : {}
                }
                transition={
                  isCurrent
                    ? { duration: 2, repeat: Infinity, ease: 'easeInOut' }
                    : {}
                }
              >
                {isCompleted ? (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  level.id
                )}
              </motion.div>
              <span
                className={`mt-1.5 text-[9px] font-medium whitespace-nowrap ${
                  isCompleted
                    ? 'text-zk-violet'
                    : isCurrent
                      ? 'text-zk-violet'
                      : 'text-muted-foreground/50'
                }`}
              >
                {level.title}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ===== Main Component =====
export default function ProfileSection() {
  const { userProgress, userName } = useAppStore()
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )

  if (!mounted) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-muted rounded" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  const { xp, level, streak, completedLessons, achievements, skillPoints } = userProgress
  const displayName = userName || 'ZK Explorer'
  const xpInCurrentLevel = xp % 500
  const levelProgress = (xpInCurrentLevel / 500) * 100

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Welcome back, {displayName}
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Your journey through zero knowledge
          </p>
        </div>
        <Badge
          variant="outline"
          className="text-zk-violet border-zk-violet/40 bg-zk-violet/10 px-3 py-1 text-sm"
        >
          Level {level}
        </Badge>
      </div>

      {/* Main Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <Card className="bg-zk-surface border-zk-border hover:border-zk-violet/30 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-md bg-zk-violet/15 flex items-center justify-center">
                  <Zap className="w-3.5 h-3.5 text-zk-violet" />
                </div>
                <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Total XP</span>
              </div>
              <div className="text-2xl font-bold text-foreground">
                <AnimatedCounter target={xp} />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-zk-surface border-zk-border hover:border-zk-violet/30 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-md bg-zk-violet/15 flex items-center justify-center">
                  <Star className="w-3.5 h-3.5 text-zk-violet" />
                </div>
                <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Level</span>
              </div>
              <div className="text-2xl font-bold text-foreground mb-1.5">{level}</div>
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>{xpInCurrentLevel} XP</span>
                  <span>500 XP</span>
                </div>
                <Progress value={levelProgress} className="h-1.5" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="bg-zk-surface border-zk-border hover:border-zk-amber/30 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-md bg-zk-amber/15 flex items-center justify-center">
                  <Flame className="w-3.5 h-3.5 text-zk-amber" />
                </div>
                <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Streak</span>
              </div>
              <div className="text-2xl font-bold text-foreground">
                {streak} <span className="text-sm font-normal text-muted-foreground">days</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-zk-surface border-zk-border hover:border-zk-emerald/30 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-md bg-zk-emerald/15 flex items-center justify-center">
                  <BookOpen className="w-3.5 h-3.5 text-zk-emerald" />
                </div>
                <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Lessons</span>
              </div>
              <div className="text-2xl font-bold text-foreground">
                {completedLessons.length}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Skill Radar + XP History row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card className="bg-zk-surface border-zk-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-foreground">Skill Distribution</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <SkillRadarChart skillPoints={skillPoints} />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-zk-surface border-zk-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-foreground">XP History</CardTitle>
              <p className="text-[11px] text-muted-foreground">Last 7 days</p>
            </CardHeader>
            <CardContent className="pt-2">
              <XPSparkline />
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Achievements */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <Card className="bg-zk-surface border-zk-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-foreground">Achievements</CardTitle>
            <p className="text-[11px] text-muted-foreground">
              {achievements.length} of {ACHIEVEMENT_DEFS.length} unlocked
            </p>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {ACHIEVEMENT_DEFS.map((achievement, i) => {
                const isUnlocked = achievements.includes(achievement.id)
                const catColor = CATEGORY_COLORS[achievement.category]
                const catGlow = CATEGORY_GLOW[achievement.category]

                return (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + i * 0.04 }}
                    className={`relative flex flex-col items-center text-center p-3 rounded-xl border transition-all ${
                      isUnlocked
                        ? `${catColor} ${catGlow}`
                        : 'bg-muted/20 border-border opacity-50'
                    }`}
                  >
                    {!isUnlocked && (
                      <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-background/40 backdrop-blur-[1px]">
                        <Lock className="w-4 h-4 text-muted-foreground/50" />
                      </div>
                    )}
                    <div className={`mb-2 ${isUnlocked ? '' : 'grayscale'}`}>
                      {achievement.icon}
                    </div>
                    <h4 className="text-[11px] font-semibold leading-tight mb-0.5">
                      {achievement.title}
                    </h4>
                    <p className="text-[9px] text-muted-foreground leading-tight">
                      {achievement.description}
                    </p>
                    {isUnlocked && (
                      <span className="mt-1.5 text-[9px] font-bold text-zk-violet">
                        +{achievement.xpBonus} XP
                      </span>
                    )}
                  </motion.div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Level Progress */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
      >
        <Card className="bg-zk-surface border-zk-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-foreground">Level Progress</CardTitle>
            <p className="text-[11px] text-muted-foreground">
              Currently on Level {level}: {allLevels[level - 1]?.title || 'Unknown'}
            </p>
          </CardHeader>
          <CardContent className="pt-2 px-8">
            <LevelProgressBar currentLevel={level} />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
