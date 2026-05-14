'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { getLesson, getLessonLevel, getModule, allLevels } from '@/lib/curriculum';
import type { CurriculumLesson, LessonSection, QuizQuestion } from '@/lib/curriculum';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ArrowLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Zap,
  BookOpen,
  Code2,
  SquareFunction,
  Lightbulb,
  Play,
  Award,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Content renderers
// ---------------------------------------------------------------------------

function TextBlock({ content, accentColor }: { content: string; accentColor: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="text-foreground/90 leading-[1.8] text-[0.935rem] tracking-wide"
    >
      {content}
    </motion.div>
  );
}

function CodeBlock({
  content,
  language,
  accentColor,
}: {
  content: string;
  language?: string;
  accentColor: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative rounded-lg overflow-hidden border border-border/40"
    >
      {/* Accent bar */}
      <div className="h-[2px]" style={{ backgroundColor: accentColor }} />
      {/* Language badge */}
      {language && (
        <div className="absolute top-3 right-3 z-10">
          <Badge
            variant="outline"
            className="text-[10px] font-mono px-1.5 py-0 bg-background/80 backdrop-blur-sm border-border/50"
          >
            {language}
          </Badge>
        </div>
      )}
      <div className="bg-[oklch(0.10_0.01_270)]">
        <SyntaxHighlighter
          language={language || 'typescript'}
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            padding: '1.25rem',
            fontSize: '0.825rem',
            lineHeight: 1.65,
            background: 'transparent',
          }}
          showLineLines={false}
          wrapLongLines
        >
          {content}
        </SyntaxHighlighter>
      </div>
    </motion.div>
  );
}

function MathBlock({ content, accentColor }: { content: string; accentColor: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative rounded-lg border border-border/40 bg-muted/30 p-5 overflow-hidden"
    >
      <div className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ backgroundColor: accentColor }} />
      <pre className="font-mono text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap pl-3">
        {content}
      </pre>
    </motion.div>
  );
}

function CalloutBlock({ content, accentColor }: { content: string; accentColor: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative rounded-lg border border-border/40 p-5 overflow-hidden"
      style={{ backgroundColor: `${accentColor}08` }}
    >
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px]"
        style={{ backgroundColor: accentColor }}
      />
      <div className="flex items-start gap-3 pl-3">
        <Lightbulb className="w-4 h-4 mt-0.5 shrink-0" style={{ color: accentColor }} />
        <p className="text-sm leading-relaxed text-foreground/85">{content}</p>
      </div>
    </motion.div>
  );
}

function VisualizationBlock({
  section,
  accentColor,
}: {
  section: LessonSection;
  accentColor: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="border-border/40 overflow-hidden">
        <div className="h-[2px]" style={{ backgroundColor: accentColor }} />
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${accentColor}15` }}
              >
                <Play className="w-4 h-4" style={{ color: accentColor }} />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Interactive Visualization</p>
                <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                  {section.vizType || 'visualization'}
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="text-xs gap-1.5"
              style={{ borderColor: `${accentColor}40`, color: accentColor }}
            >
              <Play className="w-3 h-3" />
              Launch
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function InteractiveBlock({
  section,
  accentColor,
}: {
  section: LessonSection;
  accentColor: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="border-border/40 overflow-hidden">
        <div className="h-[2px]" style={{ backgroundColor: accentColor }} />
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${accentColor}15` }}
              >
                <Code2 className="w-4 h-4" style={{ color: accentColor }} />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Interactive Exercise</p>
                <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                  {section.vizType || 'interactive'}
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="text-xs gap-1.5"
              style={{ borderColor: `${accentColor}40`, color: accentColor }}
            >
              <Play className="w-3 h-3" />
              Launch
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/** Renders a single LessonSection based on its type. */
function SectionRenderer({
  section,
  accentColor,
  index,
}: {
  section: LessonSection;
  accentColor: string;
  index: number;
}) {
  switch (section.type) {
    case 'text':
      return <TextBlock content={section.content} accentColor={accentColor} />;
    case 'code':
      return (
        <CodeBlock
          content={section.content}
          language={section.language}
          accentColor={accentColor}
        />
      );
    case 'math':
      return <MathBlock content={section.content} accentColor={accentColor} />;
    case 'callout':
      return <CalloutBlock content={section.content} accentColor={accentColor} />;
    case 'visualization':
      return <VisualizationBlock section={section} accentColor={accentColor} />;
    case 'interactive':
      return <InteractiveBlock section={section} accentColor={accentColor} />;
    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
// Quiz component
// ---------------------------------------------------------------------------

function QuizSection({
  questions,
  accentColor,
  onAllAnswered,
}: {
  questions: QuizQuestion[];
  accentColor: string;
  onAllAnswered: (score: number) => void;
}) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const allDone = questions.every((q) => revealed[q.id]);

  const handleSelect = (qId: string, optionIdx: number, correctIdx: number) => {
    if (revealed[qId]) return; // already answered
    setAnswers((prev) => ({ ...prev, [qId]: optionIdx }));
    setRevealed((prev) => ({ ...prev, [qId]: true }));
  };

  useEffect(() => {
    if (allDone && questions.length > 0) {
      const score = questions.reduce((acc, q) => acc + (answers[q.id] === q.correctIndex ? 1 : 0), 0);
      onAllAnswered(score);
    }
  }, [allDone, answers, onAllAnswered, questions]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-2 pt-6 border-t border-border/40">
        <BookOpen className="w-4 h-4" style={{ color: accentColor }} />
        <h3 className="text-sm font-semibold text-foreground">Knowledge Check</h3>
      </div>

      {questions.map((q, qi) => {
        const isRevealed = revealed[q.id];
        const selectedIdx = answers[q.id];
        const isCorrect = selectedIdx === q.correctIndex;

        return (
          <motion.div
            key={q.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: qi * 0.08 }}
            className="space-y-3"
          >
            <p className="text-sm font-medium text-foreground">
              {qi + 1}. {q.question}
            </p>

            <div className="grid gap-2">
              {q.options.map((opt, oi) => {
                const isSelected = selectedIdx === oi;
                const isThisCorrect = oi === q.correctIndex;
                let optStyle = 'border-border/40 bg-muted/20 text-foreground/80 hover:bg-muted/40';
                if (isRevealed) {
                  if (isThisCorrect) {
                    optStyle = `border-emerald-500/50 bg-emerald-500/10 text-emerald-400`;
                  } else if (isSelected && !isCorrect) {
                    optStyle = `border-red-500/50 bg-red-500/10 text-red-400`;
                  } else {
                    optStyle = 'border-border/30 bg-muted/10 text-muted-foreground/60';
                  }
                } else if (isSelected) {
                  optStyle = `border-[${accentColor}] bg-[${accentColor}15]`;
                }

                return (
                  <button
                    key={oi}
                    type="button"
                    disabled={isRevealed}
                    onClick={() => handleSelect(q.id, oi, q.correctIndex)}
                    className={cn(
                      'w-full text-left px-4 py-2.5 rounded-lg border text-sm transition-all duration-200',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      optStyle,
                      !isRevealed && 'cursor-pointer'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      {isRevealed && isThisCorrect && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      )}
                      {isRevealed && isSelected && !isCorrect && (
                        <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                      )}
                      {!isRevealed && (
                        <span className="w-4 h-4 rounded-full border border-border/60 shrink-0 flex items-center justify-center text-[10px] text-muted-foreground font-medium">
                          {String.fromCharCode(65 + oi)}
                        </span>
                      )}
                      <span>{opt}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Explanation */}
            <AnimatePresence>
              {isRevealed && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div
                    className="rounded-lg p-3 text-xs leading-relaxed"
                    style={{
                      backgroundColor: isCorrect ? 'oklch(0.72 0.18 155 / 8%)' : 'oklch(0.65 0.22 20 / 8%)',
                      borderColor: isCorrect ? 'oklch(0.72 0.18 155 / 25%)' : 'oklch(0.65 0.22 20 / 25%)',
                      borderWidth: 1,
                    }}
                  >
                    <span className="font-medium" style={{ color: isCorrect ? '#10b981' : '#ef4444' }}>
                      {isCorrect ? 'Correct!' : 'Not quite.'}
                    </span>{' '}
                    <span className="text-muted-foreground">{q.explanation}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Celebration confetti (simple Framer Motion particle burst)
// ---------------------------------------------------------------------------

function CelebrationOverlay({ onDone }: { onDone: () => void }) {
  const particles = useMemo(() => {
    const colors = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899'];
    return Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 400 - 200,
      y: -(Math.random() * 500 + 200),
      rotate: Math.random() * 720 - 360,
      scale: Math.random() * 0.6 + 0.4,
      color: colors[i % colors.length],
      delay: Math.random() * 0.3,
    }));
  }, []);

  useEffect(() => {
    const timer = setTimeout(onDone, 2500);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute w-2 h-2 rounded-sm"
          style={{ backgroundColor: p.color }}
          initial={{ x: 0, y: 0, rotate: 0, scale: 0, opacity: 1 }}
          animate={{
            x: p.x,
            y: p.y,
            rotate: p.rotate,
            scale: p.scale,
            opacity: 0,
          }}
          transition={{
            duration: 1.8,
            delay: p.delay,
            ease: 'easeOut',
          }}
        />
      ))}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className="flex flex-col items-center gap-2"
      >
        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
          <Award className="w-8 h-8 text-primary" />
        </div>
        <p className="text-lg font-bold text-foreground">Lesson Complete!</p>
      </motion.div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function LessonViewer() {
  const { currentLessonId, userProgress, completeLesson, setCurrentLesson, setView, updateSkillPoints, saveQuizScore } =
    useAppStore();

  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Look up lesson + level data
  const lesson: CurriculumLesson | undefined = useMemo(
    () => (currentLessonId ? getLesson(currentLessonId) : undefined),
    [currentLessonId]
  );

  const level = useMemo(
    () => (currentLessonId ? getLessonLevel(currentLessonId) : undefined),
    [currentLessonId]
  );

  const mod = useMemo(() => {
    if (!lesson) return undefined;
    for (const l of allLevels) {
      for (const m of l.modules) {
        if (m.lessons.some((les) => les.id === lesson.id)) return m;
      }
    }
    return undefined;
  }, [lesson]);

  const accentColor = level?.color || '#8b5cf6';

  // Scroll to top when lesson changes (DOM side-effect only)
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [currentLessonId]);

  const isLessonCompleted = lesson
    ? userProgress.completedLessons.includes(lesson.id)
    : false;

  const handleQuizComplete = useCallback(
    (score: number) => {
      setQuizScore(score);
    },
    []
  );

  const handleCompleteLesson = useCallback(() => {
    if (!lesson) return;
    completeLesson(lesson.id, lesson.xp);
    // Update skill points based on lesson type
    const skillMap: Record<string, string> = {
      theory: 'cryptography',
      interactive: 'circuits',
      coding: 'engineering',
      challenge: 'protocols',
      project: 'applications',
    };
    const skill = skillMap[lesson.type] || 'cryptography';
    updateSkillPoints(skill, lesson.xp);
    // Save quiz score if applicable
    if (quizScore !== null && lesson.quiz) {
      saveQuizScore(lesson.id, quizScore);
    }
    setShowCelebration(true);
  }, [lesson, completeLesson, updateSkillPoints, saveQuizScore, quizScore]);

  const handleBackToRoadmap = useCallback(() => {
    setCurrentLesson(null);
    setView('roadmap');
  }, [setCurrentLesson, setView]);

  const handleCelebrationDone = useCallback(() => {
    setShowCelebration(false);
    handleBackToRoadmap();
  }, [handleBackToRoadmap]);

  // No lesson selected
  if (!lesson || !level || !mod) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Select a lesson from the roadmap to begin.</p>
      </div>
    );
  }

  // Separate content: text-heavy sections vs. interactive/code/visualization sections
  const textSections = lesson.content.filter(
    (s) => s.type === 'text' || s.type === 'callout' || s.type === 'math'
  );
  const interactiveSections = lesson.content.filter(
    (s) => s.type === 'code' || s.type === 'visualization' || s.type === 'interactive'
  );

  return (
    <div className="relative w-full max-w-7xl mx-auto">
      {/* Celebration overlay */}
      <AnimatePresence>
        {showCelebration && <CelebrationOverlay onDone={handleCelebrationDone} />}
      </AnimatePresence>

      {/* Top bar */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border/40"
      >
        <div className="flex items-center gap-3 px-4 py-3 max-w-7xl mx-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToRoadmap}
            className="gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>

          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-0" aria-label="Breadcrumb">
            <span className="truncate" style={{ color: accentColor }}>
              L{level.id}: {level.title}
            </span>
            <ChevronRight className="w-3 h-3 shrink-0" />
            <span className="truncate">{mod.title}</span>
            <ChevronRight className="w-3 h-3 shrink-0" />
            <span className="truncate text-foreground font-medium">{lesson.title}</span>
          </nav>

          {/* Progress */}
          <div className="ml-auto flex items-center gap-3 shrink-0">
            <Badge
              variant="outline"
              className="text-[10px] gap-1"
              style={{ borderColor: `${accentColor}40`, color: accentColor }}
            >
              <Zap className="w-3 h-3" />
              {lesson.xp} XP
            </Badge>
            {isLessonCompleted && (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            )}
          </div>
        </div>

        {/* Thin progress bar showing position in level */}
        <div className="h-[2px] bg-muted/30">
          <motion.div
            className="h-full"
            style={{ backgroundColor: accentColor }}
            initial={{ width: 0 }}
            animate={{
              width: isLessonCompleted ? '100%' : (() => {
                const lessonsInLevel = level.modules.flatMap((m) => m.lessons);
                const currentIdx = lessonsInLevel.findIndex((l) => l.id === lesson.id);
                return `${Math.max(5, ((currentIdx + 1) / lessonsInLevel.length) * 100)}%`;
              })(),
            }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>
      </motion.div>

      {/* Main content area */}
      <div className="flex flex-col lg:flex-row gap-0 lg:gap-6 px-4 py-6">
        {/* Left panel: lesson content */}
        <div
          ref={scrollRef}
          className="flex-1 min-w-0 lg:max-h-[calc(100vh-120px)] lg:overflow-y-auto lg:pr-2"
          style={{ scrollbarGutter: 'stable' }}
        >
          {/* Lesson header */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex items-center gap-2 mb-3">
              <Badge
                variant="outline"
                className="text-[10px] capitalize"
                style={{ borderColor: `${accentColor}40`, color: accentColor }}
              >
                {lesson.type}
              </Badge>
              <span className="text-xs text-muted-foreground">{lesson.duration}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight leading-tight">
              {lesson.title}
            </h1>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
              {lesson.description}
            </p>
          </motion.div>

          {/* Lesson sections - render all on mobile, only text on desktop left panel */}
          <div className="space-y-6">
            {/* On mobile: render ALL sections. On desktop: only text sections here. */}
            <div className="space-y-6 lg:space-y-6">
              {lesson.content.map((section, i) => {
                // On desktop (lg+), skip interactive/code sections here (they go to right panel)
                // But on mobile we render everything
                return (
                  <div key={i} className="lg:hidden">
                    <SectionRenderer section={section} accentColor={accentColor} index={i} />
                  </div>
                );
              })}

              {/* Desktop: text sections in left panel */}
              {textSections.map((section, i) => (
                <div key={`text-${i}`} className="hidden lg:block">
                  <SectionRenderer section={section} accentColor={accentColor} index={i} />
                </div>
              ))}
            </div>

            {/* Quiz section - keyed by lesson id so state resets on lesson change */}
            {lesson.quiz && lesson.quiz.length > 0 && (
              <QuizSection
                key={lesson.id}
                questions={lesson.quiz}
                accentColor={accentColor}
                onAllAnswered={handleQuizComplete}
              />
            )}

            {/* Complete Lesson button */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="pt-6 pb-8 border-t border-border/30"
            >
              {isLessonCompleted ? (
                <div className="flex items-center gap-3 text-sm text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-medium">You have completed this lesson</span>
                </div>
              ) : (
                <Button
                  size="lg"
                  className="gap-2 text-sm font-semibold px-8"
                  style={{
                    backgroundColor: accentColor,
                    color: 'oklch(0.12 0.01 270)',
                  }}
                  onClick={handleCompleteLesson}
                >
                  <Sparkles className="w-4 h-4" />
                  Complete Lesson
                  <Zap className="w-4 h-4" />
                  <span className="font-mono">{lesson.xp} XP</span>
                </Button>
              )}
            </motion.div>
          </div>
        </div>

        {/* Right panel: interactive content (desktop only) */}
        {interactiveSections.length > 0 && (
          <div className="hidden lg:block lg:w-[420px] shrink-0">
            <div className="sticky top-28 space-y-6 lg:max-h-[calc(100vh-140px)] lg:overflow-y-auto lg:pr-1">
              <div className="flex items-center gap-2 mb-2">
                <Code2 className="w-4 h-4" style={{ color: accentColor }} />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Code & Visualizations
                </span>
              </div>
              {interactiveSections.map((section, i) => (
                <SectionRenderer
                  key={`interactive-${i}`}
                  section={section}
                  accentColor={accentColor}
                  index={i}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
