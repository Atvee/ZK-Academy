'use client'

import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Clock, HardDrive, Cpu, CheckCircle2, Circle, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type ProofSystem = 'groth16' | 'plonk' | 'stark'

interface ProofParams {
  system: ProofSystem
  circuitSize: number
  securityLevel: number
  trustedSetup: boolean
}

interface ProofEstimates {
  proofSize: number
  provingTime: number
  verificationTime: number
  numConstraints: number
  numPublicInputs: number
}

interface PipelineStep {
  id: string
  label: string
  description: string
  timing: number
}

const PIPELINE_STEPS: { [K in ProofSystem]: PipelineStep[] } = {
  groth16: [
    { id: 'setup', label: 'Setup', description: 'Generate SRS from trusted ceremony', timing: 0 },
    { id: 'witness', label: 'Witness Gen', description: 'Compute full assignment vector', timing: 0 },
    { id: 'proof', label: 'Proof Creation', description: 'Compute A, B, C group elements', timing: 0 },
    { id: 'verify', label: 'Verification', description: 'Check pairing equation e(A,B)=...', timing: 0 },
  ],
  plonk: [
    { id: 'setup', label: 'Setup', description: 'Universal KZG setup (reusable)', timing: 0 },
    { id: 'witness', label: 'Witness Gen', description: 'Compute wire assignments', timing: 0 },
    { id: 'proof', label: 'Proof Creation', description: 'Polynomial commitments + evaluations', timing: 0 },
    { id: 'verify', label: 'Verification', description: 'Verify commitments + pairing check', timing: 0 },
  ],
  stark: [
    { id: 'setup', label: 'Setup', description: 'Hash-based (no trusted setup)', timing: 0 },
    { id: 'witness', label: 'Trace Gen', description: 'Build execution trace table', timing: 0 },
    { id: 'proof', label: 'FRI Proof', description: 'Commit + fold polynomial layers', timing: 0 },
    { id: 'verify', label: 'Verification', description: 'Verify FRI + check constraints', timing: 0 },
  ],
}

function computeEstimates(params: ProofParams): ProofEstimates {
  const { system, circuitSize, securityLevel, trustedSetup } = params
  const n = circuitSize
  const sec = securityLevel

  // Number of constraints ≈ circuit size
  const numConstraints = n
  // Public inputs typically much smaller
  const numPublicInputs = Math.max(1, Math.floor(Math.log2(n)))

  let proofSize: number
  let provingTime: number
  let verificationTime: number

  if (system === 'groth16') {
    // Groth16: constant proof size (3 group elements)
    proofSize = 192 + numPublicInputs * 32
    // Proving time: O(n) with MSM
    provingTime = (n * 0.003 + n * 0.0008 * Math.log2(n)) * (sec / 128)
    // Verification: 3 pairings + public input check
    verificationTime = 1.5 + numPublicInputs * 0.2
  } else if (system === 'plonk') {
    // PLONK: slightly larger proof, ~400-500 bytes
    proofSize = 400 + Math.floor(Math.log2(n)) * 32
    // Proving: O(n) with FFTs
    provingTime = (n * 0.004 + n * 0.0006 * Math.log2(n)) * (sec / 128)
    // Verification: 1 pairing + FFT-based check
    verificationTime = 2.5 + numPublicInputs * 0.3
  } else {
    // STARK: much larger proof (log(n) * security), no trusted setup
    const friRounds = Math.ceil(Math.log2(n))
    proofSize = friRounds * sec * 4 + 200
    // Proving: O(n * log(n)) with FRI
    provingTime = (n * 0.005 + n * 0.0005 * Math.log2(n) * Math.log2(n)) * (sec / 128)
    // Verification: O(log^2(n))
    verificationTime = 8 + friRounds * 2 + numPublicInputs * 0.5
  }

  // Trusted setup overhead
  if (trustedSetup && system === 'groth16') {
    provingTime *= 0.85 // SRS caching speeds up
  }

  return {
    proofSize: Math.round(proofSize),
    provingTime: Math.round(provingTime * 10) / 10,
    verificationTime: Math.round(verificationTime * 100) / 100,
    numConstraints,
    numPublicInputs,
  }
}

function getStepTimings(params: ProofParams): number[] {
  const { system, circuitSize, securityLevel } = params
  const n = circuitSize
  const sec = securityLevel
  const scale = sec / 128

  if (system === 'groth16') {
    const setupTime = params.trustedSetup ? 0 : Math.round(n * 0.001 * scale * 10) / 10
    const witnessTime = Math.round(n * 0.0005 * scale * 10) / 10
    const proofTime = Math.round(n * 0.002 * scale * 10) / 10
    const verifyTime = 1.5
    return [setupTime, witnessTime, proofTime, verifyTime]
  } else if (system === 'plonk') {
    const setupTime = 0.5
    const witnessTime = Math.round(n * 0.0006 * scale * 10) / 10
    const proofTime = Math.round(n * 0.0025 * scale * 10) / 10
    const verifyTime = 2.5
    return [setupTime, witnessTime, proofTime, verifyTime]
  } else {
    const setupTime = 0.1
    const witnessTime = Math.round(n * 0.0004 * scale * 10) / 10
    const proofTime = Math.round(n * 0.003 * scale * 10) / 10
    const verifyTime = 8 + Math.ceil(Math.log2(n)) * 2
    return [setupTime, witnessTime, proofTime, verifyTime]
  }
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatTime(ms: number): string {
  if (ms < 1) return `${(ms * 1000).toFixed(0)} \u03BCs`
  if (ms < 1000) return `${ms.toFixed(1)} ms`
  return `${(ms / 1000).toFixed(2)} s`
}

function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return n.toString()
}

// ===== Comparison Table =====
function ComparisonTable({ params }: { params: ProofParams }) {
  const systems: ProofSystem[] = ['groth16', 'plonk', 'stark']

  const estimates = systems.map(sys => ({
    system: sys,
    ...computeEstimates({ ...params, system: sys, trustedSetup: sys === 'groth16' ? params.trustedSetup : false }),
  }))

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[11px]">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-2 pr-3 text-muted-foreground font-medium">System</th>
            <th className="text-right py-2 px-2 text-muted-foreground font-medium">Proof Size</th>
            <th className="text-right py-2 px-2 text-muted-foreground font-medium">Proving</th>
            <th className="text-right py-2 px-2 text-muted-foreground font-medium">Verifying</th>
            <th className="text-right py-2 pl-2 text-muted-foreground font-medium">Setup</th>
          </tr>
        </thead>
        <tbody>
          {estimates.map(est => {
            const isActive = est.system === params.system
            return (
              <tr
                key={est.system}
                className={`border-b border-border/50 ${isActive ? 'bg-zk-violet/5' : ''}`}
              >
                <td className={`py-2 pr-3 font-semibold ${isActive ? 'text-zk-violet' : 'text-foreground'}`}>
                  {est.system.toUpperCase()}
                </td>
                <td className="text-right py-2 px-2 text-foreground tabular-nums">
                  {formatBytes(est.proofSize)}
                </td>
                <td className="text-right py-2 px-2 text-foreground tabular-nums">
                  {formatTime(est.provingTime)}
                </td>
                <td className="text-right py-2 px-2 text-foreground tabular-nums">
                  {formatTime(est.verificationTime)}
                </td>
                <td className="text-right py-2 pl-2 text-muted-foreground">
                  {est.system === 'stark' ? 'Transparent' : 'Required'}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ===== Pipeline Step =====
function PipelineStep({
  step,
  index,
  status,
  timing,
}: {
  step: PipelineStep
  index: number
  status: 'pending' | 'active' | 'completed'
  timing: number
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex flex-col items-center">
        <motion.div
          className={`w-9 h-9 rounded-lg flex items-center justify-center border transition-all ${
            status === 'completed'
              ? 'bg-zk-cyan/15 border-zk-cyan/40 text-zk-cyan'
              : status === 'active'
                ? 'bg-zk-violet/15 border-zk-violet/40 text-zk-violet'
                : 'bg-muted/30 border-border text-muted-foreground/50'
          }`}
          animate={
            status === 'active'
              ? { scale: [1, 1.05, 1], borderColor: ['oklch(0.72 0.19 280 / 40%)', 'oklch(0.72 0.19 280 / 80%)', 'oklch(0.72 0.19 280 / 40%)'] }
              : {}
          }
          transition={{ duration: 1, repeat: status === 'active' ? Infinity : 0 }}
        >
          {status === 'completed' ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : status === 'active' ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Circle className="w-4 h-4" />
          )}
        </motion.div>
        {index < 3 && (
          <motion.div
            className={`w-0.5 h-6 ${
              status === 'completed' ? 'bg-zk-cyan/40' : 'bg-border'
            }`}
          />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span
            className={`text-xs font-semibold ${
              status === 'completed'
                ? 'text-zk-cyan'
                : status === 'active'
                  ? 'text-zk-violet'
                  : 'text-muted-foreground/60'
            }`}
          >
            {step.label}
          </span>
          {timing > 0 && (
            <span
              className={`text-[10px] tabular-nums ${
                status === 'pending' ? 'text-muted-foreground/30' : 'text-muted-foreground'
              }`}
            >
              {formatTime(timing)}
            </span>
          )}
        </div>
        <p
          className={`text-[10px] leading-tight mt-0.5 ${
            status === 'pending' ? 'text-muted-foreground/30' : 'text-muted-foreground'
          }`}
        >
          {step.description}
        </p>
      </div>
    </div>
  )
}

// ===== Main Component =====
export default function SandboxSection() {
  const [system, setSystem] = useState<ProofSystem>('groth16')
  const [circuitSize, setCircuitSize] = useState(10000)
  const [securityLevel, setSecurityLevel] = useState(128)
  const [trustedSetup, setTrustedSetup] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeStepIndex, setActiveStepIndex] = useState(-1)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [hasResult, setHasResult] = useState(false)

  const params: ProofParams = useMemo(
    () => ({ system, circuitSize, securityLevel, trustedSetup }),
    [system, circuitSize, securityLevel, trustedSetup]
  )

  const estimates = useMemo(() => computeEstimates(params), [params])
  const steps = useMemo(() => PIPELINE_STEPS[system], [system])
  const stepTimings = useMemo(() => getStepTimings(params), [params])

  const handleGenerate = useCallback(() => {
    if (isGenerating) return

    setIsGenerating(true)
    setCompletedSteps([])
    setActiveStepIndex(0)
    setHasResult(false)

    const delays = stepTimings.map((timing) => {
      // Scale down for demo purposes - real timing would be seconds to minutes
      return Math.max(400, Math.min(2000, timing * 20))
    })

    let elapsed = 0
    delays.forEach((delay, i) => {
      setTimeout(() => {
        setActiveStepIndex(i)
      }, elapsed)

      elapsed += delay

      setTimeout(() => {
        setCompletedSteps(prev => [...prev, i])
        if (i < steps.length - 1) {
          setActiveStepIndex(i + 1)
        } else {
          setActiveStepIndex(-1)
          setIsGenerating(false)
          setHasResult(true)
        }
      }, elapsed)
    })
  }, [isGenerating, stepTimings, steps.length])

  const circuitSizeLabel = formatNumber(circuitSize)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">ZK Sandbox</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Experiment with proof parameters and observe the effects
        </p>
      </div>

      {/* Three panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Panel 1: Parameters */}
        <Card className="bg-zk-surface border-zk-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-semibold text-foreground">Parameters</CardTitle>
            <CardDescription className="text-[11px]">Configure proof system settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 pt-0">
            {/* Proof System Selector */}
            <div className="space-y-2">
              <Label className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
                Proof System
              </Label>
              <Select
                value={system}
                onValueChange={(v) => setSystem(v as ProofSystem)}
              >
                <SelectTrigger className="w-full bg-muted/30 border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="groth16">Groth16</SelectItem>
                  <SelectItem value="plonk">PLONK</SelectItem>
                  <SelectItem value="stark">STARK</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Circuit Size Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
                  Circuit Size
                </Label>
                <span className="text-xs text-foreground font-semibold tabular-nums">
                  {circuitSizeLabel} constraints
                </span>
              </div>
              <Slider
                value={[Math.log10(circuitSize)]}
                onValueChange={([v]) => setCircuitSize(Math.round(Math.pow(10, v)))}
                min={2}
                max={6}
                step={0.05}
                className="w-full"
              />
              <div className="flex justify-between text-[9px] text-muted-foreground/40">
                <span>100</span>
                <span>1M</span>
              </div>
            </div>

            {/* Security Level Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
                  Security Level
                </Label>
                <span className="text-xs text-foreground font-semibold tabular-nums">
                  {securityLevel}-bit
                </span>
              </div>
              <Slider
                value={[securityLevel]}
                onValueChange={([v]) => setSecurityLevel(v)}
                min={80}
                max={256}
                step={8}
                className="w-full"
              />
              <div className="flex justify-between text-[9px] text-muted-foreground/40">
                <span>80-bit</span>
                <span>256-bit</span>
              </div>
            </div>

            {/* Trusted Setup Toggle */}
            <div className={`flex items-center justify-between ${system === 'stark' ? 'opacity-40 pointer-events-none' : ''}`}>
              <div>
                <Label className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
                  Trusted Setup
                </Label>
                <p className="text-[9px] text-muted-foreground/50 mt-0.5">
                  {system === 'stark' ? 'Not required for STARKs' : 'Enable SRS from ceremony'}
                </p>
              </div>
              <Switch
                checked={system === 'stark' ? false : trustedSetup}
                onCheckedChange={setTrustedSetup}
                disabled={system === 'stark'}
              />
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full bg-zk-violet hover:bg-zk-violet/80 text-primary-foreground rounded-lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Generate Proof
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Panel 2: Proof Pipeline */}
        <Card className="bg-zk-surface border-zk-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-semibold text-foreground">Proof Pipeline</CardTitle>
            <CardDescription className="text-[11px]">
              {system.toUpperCase()} proof generation flow
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-1">
              {steps.map((step, i) => {
                const status =
                  completedSteps.includes(i)
                    ? 'completed' as const
                    : i === activeStepIndex
                      ? 'active' as const
                      : 'pending' as const

                return (
                  <PipelineStep
                    key={step.id}
                    step={step}
                    index={i}
                    status={status}
                    timing={stepTimings[i]}
                  />
                )
              })}
            </div>

            {/* Proof size estimate */}
            <AnimatePresence>
              {hasResult && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-5 p-3 rounded-lg bg-zk-violet/5 border border-zk-violet/20"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground">Proof Size</span>
                    <span className="text-sm font-bold text-zk-violet tabular-nums">
                      {formatBytes(estimates.proofSize)}
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Panel 3: Results */}
        <Card className="bg-zk-surface border-zk-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-semibold text-foreground">Results</CardTitle>
            <CardDescription className="text-[11px]">
              Key metrics for {system.toUpperCase()}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            <AnimatePresence mode="wait">
              {hasResult || isGenerating ? (
                <motion.div
                  key="results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-3"
                >
                  {/* Metrics Grid */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 rounded-lg bg-muted/20 border border-border">
                      <div className="flex items-center gap-1.5 mb-1">
                        <HardDrive className="w-3 h-3 text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground font-medium">Proof Size</span>
                      </div>
                      <span className="text-sm font-bold text-foreground tabular-nums">
                        {formatBytes(estimates.proofSize)}
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/20 border border-border">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground font-medium">Proving Time</span>
                      </div>
                      <span className="text-sm font-bold text-foreground tabular-nums">
                        {formatTime(estimates.provingTime)}
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/20 border border-border">
                      <div className="flex items-center gap-1.5 mb-1">
                        <CheckCircle2 className="w-3 h-3 text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground font-medium">Verify Time</span>
                      </div>
                      <span className="text-sm font-bold text-foreground tabular-nums">
                        {formatTime(estimates.verificationTime)}
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/20 border border-border">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Cpu className="w-3 h-3 text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground font-medium">Constraints</span>
                      </div>
                      <span className="text-sm font-bold text-foreground tabular-nums">
                        {formatNumber(estimates.numConstraints)}
                      </span>
                    </div>
                  </div>

                  {/* Public Inputs */}
                  <div className="p-3 rounded-lg bg-muted/20 border border-border">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground font-medium">Public Inputs</span>
                      <span className="text-sm font-bold text-foreground tabular-nums">
                        {estimates.numPublicInputs}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-8 text-center"
                >
                  <div className="w-12 h-12 rounded-full bg-muted/20 flex items-center justify-center mb-3">
                    <Play className="w-5 h-5 text-muted-foreground/40" />
                  </div>
                  <p className="text-xs text-muted-foreground/60">
                    Configure parameters and generate a proof to see results
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Comparison Table */}
            <div className="mt-2">
              <h4 className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider mb-2">
                System Comparison
              </h4>
              <ComparisonTable params={params} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
