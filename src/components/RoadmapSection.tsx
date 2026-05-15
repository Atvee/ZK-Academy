'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { allLevels } from '@/lib/curriculum';
import { useAppStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  CheckCircle2,
  Lock,
  Zap,
  ChevronRight,
  Trophy,
  Brain,
  Shield,
  Cpu,
  Wrench,
  Rocket,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const SKILL_LABELS = [
  { key: 'cryptography', label: 'Cryptography', icon: Shield },
  { key: 'mathematics', label: 'Mathematics', icon: Brain },
  { key: 'circuits', label: 'Circuits', icon: Cpu },
  { key: 'protocols', label: 'Protocols', icon: Zap },
  { key: 'engineering', label: 'Engineering', icon: Wrench },
  { key: 'applications', label: 'Applications', icon: Rocket },
] as const;

const MAX_SKILL = 500; // normalisation ceiling for the radar chart

function getLevelProgress(
  level: (typeof allLevels)[number],
  completedLessons: string[]
): { completed: number; total: number; pct: number } {
  let total = 0;
  let completed = 0;
  for (const mod of level.modules) {
    for (const lesson of mod.lessons) {
      total += 1;
      if (completedLessons.includes(lesson.id)) completed += 1;
    }
  }
  return { completed, total, pct: total === 0 ? 0 : Math.round((completed / total) * 100) };
}

function getXpEarned(
  level: (typeof allLevels)[number],
  completedLessons: string[]
): number {
  let xp = 0;
  for (const mod of level.modules) {
    for (const lesson of mod.lessons) {
      if (completedLessons.includes(lesson.id)) xp += lesson.xp;
    }
  }
  return xp;
}

/** Returns the id of the first incomplete lesson in a level (or null). */
function getFirstIncompleteLesson(
  level: (typeof allLevels)[number],
  completedLessons: string[]
): string | null {
  for (const mod of level.modules) {
    for (const lesson of mod.lessons) {
      if (!completedLessons.includes(lesson.id)) return lesson.id;
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Animated SVG connecting line between levels */
function ConnectingLine({ color, active, completed }: { color: string; active: boolean; completed: boolean }) {
  return (
    <div className="flex justify-center py-1">
      <svg width="4" height="48" viewBox="0 0 4 48" className="overflow-visible">
        <motion.line
          x1="2"
          y1="0"
          x2="2"
          y2="48"
          stroke={completed ? color : active ? color : 'oklch(0.28 0.03 270)'}
          strokeWidth={completed ? 3 : 2}
          strokeLinecap="round"
          strokeDasharray={completed ? 'none' : '6 6'}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          opacity={completed ? 1 : active ? 0.7 : 0.3}
        />
        {active && !completed && (
          <motion.line
            x1="2"
            y1="0"
            x2="2"
            y2="48"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeDasharray="6 6"
            className="zk-connection-line"
            opacity={0.8}
          />
        )}
        {completed && (
          <motion.circle
            cx="2"
            cy="24"
            r="3"
            fill={color}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
          />
        )}
      </svg>
    </div>
  );
}

/** Hexagonal radar chart rendered with SVG */
function SkillRadar({ skillPoints }: { skillPoints: Record<string, number> }) {
  const size = 220;
  const cx = size / 2;
  const cy = size / 2;
  const outerR = 90;
  const levels = [0.2, 0.4, 0.6, 0.8, 1.0];
  const n = SKILL_LABELS.length;

  const angleStep = (2 * Math.PI) / n;
  const pointAt = (idx: number, r: number) => ({
    x: cx + r * Math.sin(angleStep * idx - Math.PI / 2),
    y: cy - r * Math.cos(angleStep * idx - Math.PI / 2),
  });

  const values = SKILL_LABELS.map((s) => Math.min((skillPoints[s.key] || 0) / MAX_SKILL, 1));
  const dataPoints = values.map((v, i) => pointAt(i, outerR * v));
  const dataPath = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + 'Z';

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="mx-auto"
      role="img"
      aria-label="Skill radar chart"
    >
      {/* Background rings */}
      {levels.map((lvl, li) => {
        const ring = Array.from({ length: n }, (_, i) => pointAt(i, outerR * lvl));
        const d = ring.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + 'Z';
        return (
          <path
            key={li}
            d={d}
            fill="none"
            stroke="oklch(0.30 0.03 270)"
            strokeWidth={1}
            opacity={0.5}
          />
        );
      })}

      {/* Axis lines */}
      {SKILL_LABELS.map((_, i) => {
        const p = pointAt(i, outerR);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={p.x}
            y2={p.y}
            stroke="oklch(0.30 0.03 270)"
            strokeWidth={1}
            opacity={0.3}
          />
        );
      })}

      {/* Data shape */}
      <motion.path
        d={dataPath}
        fill="oklch(0.72 0.19 280 / 15%)"
        stroke="oklch(0.72 0.19 280)"
        strokeWidth={2}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        style={{ transformOrigin: `${cx}px ${cy}px` }}
      />

      {/* Data points */}
      {dataPoints.map((p, i) => (
        <motion.circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={4}
          fill="oklch(0.72 0.19 280)"
          stroke="oklch(0.12 0.01 270)"
          strokeWidth={2}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5 + i * 0.08, type: 'spring', stiffness: 300 }}
        />
      ))}

      {/* Labels */}
      {SKILL_LABELS.map((s, i) => {
        const p = pointAt(i, outerR + 22);
        return (
          <text
            key={s.key}
            x={p.x}
            y={p.y}
            textAnchor="middle"
            dominantBaseline="central"
            className="fill-muted-foreground text-[10px] font-medium"
          >
            {s.label}
          </text>
        );
      })}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function RoadmapSection() {
  const { userProgress, setCurrentLesson, setCurrentLevel, setView } = useAppStore();

  const completedLessons = userProgress.completedLessons;

  // Determine which levels are completed / active / locked
  const levelStates = useMemo(() => {
    return allLevels.map((level, idx) => {
      const progress = getLevelProgress(level, completedLessons);
      const xpEarned = getXpEarned(level, completedLessons);
      const prevLevel = idx > 0 ? allLevels[idx - 1] : null;
      const prevCompleted = prevLevel
        ? getLevelProgress(prevLevel, completedLessons).pct === 100
        : true;
      const isCompleted = progress.pct === 100;
      const isActive = !isCompleted && prevCompleted;
      const isLocked = !isCompleted && !prevCompleted;
      return { level, progress, xpEarned, isCompleted, isActive, isLocked };
    });
  }, [completedLessons]);

  const handleLevelClick = (
    level: (typeof allLevels)[number],
    isCompleted: boolean,
    isActive: boolean
  ) => {
    if (!isActive && !isCompleted) return; // locked
    setCurrentLevel(level.id);
    const firstIncomplete = getFirstIncompleteLesson(level, completedLessons);
    if (firstIncomplete) {
      setCurrentLesson(firstIncomplete);
    } else {
      // All completed - open the first lesson for review
      const firstLesson = level.modules[0]?.lessons[0];
      if (firstLesson) setCurrentLesson(firstLesson.id);
    }
    setView('lesson');
  };

  return (
    <section className="relative w-full max-w-6xl mx-auto px-4 py-8">
      {/* Background grid */}
      <div className="absolute inset-0 zk-grid-bg opacity-30 pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row gap-8">
        {/* Left: Level roadmap */}
        <div className="flex-1">
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
              Curriculum Roadmap
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Master ZK proofs from first principles to production systems
            </p>
          </motion.div>

          <div className="flex flex-col items-center">
            {levelStates.map((ls, idx) => {
              const { level, progress, xpEarned, isCompleted, isActive, isLocked } = ls;

              return (
                <div key={level.id} className="w-full max-w-xl">
                  {/* Connecting line (not before first level) */}
                  {idx > 0 && (
                    <ConnectingLine
                      color={level.color}
                      active={isActive}
                      completed={isCompleted}
                    />
                  )}

                  <motion.div
                    initial={{ opacity: 0, x: -24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: 0.5,
                      delay: idx * 0.1,
                      ease: 'easeOut',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => handleLevelClick(level, isCompleted, isActive)}
                      disabled={isLocked}
                      className="w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl"
                      aria-label={`Level ${level.id}: ${level.title}${isCompleted ? ' (completed)' : isActive ? ' (active)' : ' (locked)'}`}
                    >
                      <Card
                        className={[
                          'relative overflow-hidden transition-all duration-300 cursor-pointer border',
                          isLocked
                            ? 'opacity-40 cursor-not-allowed saturate-0 border-border/50'
                            : isCompleted
                              ? 'border-border/60 hover:border-border'
                              : 'hover:shadow-lg',
                          isActive ? 'border-border' : '',
                        ].join(' ')}
                        style={{
                          borderLeftWidth: 4,
                          borderLeftColor: isLocked ? 'oklch(0.28 0.03 270)' : level.color,
                          boxShadow: isActive
                            ? `0 0 24px ${level.color}25, 0 0 48px ${level.color}10`
                            : undefined,
                        }}
                      >
                        {/* Glow pulse for active level */}
                        {isActive && (
                          <motion.div
                            className="absolute inset-0 rounded-xl pointer-events-none"
                            style={{ boxShadow: `0 0 30px ${level.color}20` }}
                            animate={{
                              boxShadow: [
                                `0 0 20px ${level.color}15`,
                                `0 0 40px ${level.color}25`,
                                `0 0 20px ${level.color}15`,
                              ],
                            }}
                            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                          />
                        )}

                        <CardHeader className="pb-0">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              {/* Level number badge */}
                              <div
                                className="flex items-center justify-center w-10 h-10 rounded-lg text-sm font-bold shrink-0"
                                style={{
                                  backgroundColor: isLocked
                                    ? 'oklch(0.22 0.02 270)'
                                    : `${level.color}20`,
                                  color: isLocked
                                    ? 'oklch(0.50 0.02 270)'
                                    : level.color,
                                }}
                              >
                                {isCompleted ? (
                                  <CheckCircle2 className="w-5 h-5" style={{ color: level.color }} />
                                ) : (
                                  level.id
                                )}
                              </div>
                              <div className="min-w-0">
                                <CardTitle
                                  className="text-base font-semibold leading-tight truncate"
                                  style={{ color: isLocked ? 'oklch(0.50 0.02 270)' : undefined }}
                                >
                                  {level.title}
                                </CardTitle>
                                <CardDescription className="text-xs mt-0.5 truncate">
                                  {level.subtitle}
                                </CardDescription>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              {isLocked ? (
                                <Lock className="w-4 h-4 text-muted-foreground/50" />
                              ) : isCompleted ? (
                                <Badge
                                  variant="secondary"
                                  className="text-[10px] px-1.5 py-0"
                                  style={{ backgroundColor: `${level.color}20`, color: level.color }}
                                >
                                  Complete
                                </Badge>
                              ) : (
                                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                              )}
                            </div>
                          </div>
                        </CardHeader>

                        <CardContent className="pt-3 pb-4">
                          {/* Progress bar */}
                          <div className="flex items-center gap-3 mb-2">
                            <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                              <motion.div
                                className="h-full rounded-full"
                                style={{ backgroundColor: isLocked ? 'oklch(0.28 0.03 270)' : level.color }}
                                initial={{ width: 0 }}
                                animate={{ width: `${progress.pct}%` }}
                                transition={{ duration: 0.8, delay: idx * 0.1 + 0.3, ease: 'easeOut' }}
                              />
                            </div>
                            <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                              {progress.completed}/{progress.total} lessons
                            </span>
                          </div>

                          {/* XP row */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                              <Zap className="w-3 h-3" style={{ color: isLocked ? undefined : level.color }} />
                              <span>
                                {xpEarned} / {level.totalXp} XP
                              </span>
                            </div>
                            {isActive && (
                              <Badge
                                className="text-[10px] px-1.5 py-0"
                                style={{ backgroundColor: `${level.color}15`, color: level.color, borderColor: `${level.color}30` }}
                                variant="outline"
                              >
                                In Progress
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </button>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Skill Radar + Stats */}
        <div className="lg:w-80 shrink-0">
          <div className="lg:sticky lg:top-8 space-y-6">
            {/* Radar card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-primary" />
                    Skill Profile
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <SkillRadar skillPoints={userProgress.skillPoints} />
                  {/* Legend */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-4">
                    {SKILL_LABELS.map((s) => (
                      <div key={s.key} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <s.icon className="w-3 h-3 text-primary/70" />
                        <span className="truncate">{s.label}</span>
                        <span className="ml-auto font-medium text-foreground/80">
                          {userProgress.skillPoints[s.key] || 0}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Card className="border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold">Progress Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total XP</span>
                    <span className="font-semibold text-primary">{userProgress.xp.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Lessons Completed</span>
                    <span className="font-semibold">{userProgress.completedLessons.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Current Streak</span>
                    <span className="font-semibold">{userProgress.streak} day{userProgress.streak !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Achievements</span>
                    <span className="font-semibold">{userProgress.achievements.length}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
