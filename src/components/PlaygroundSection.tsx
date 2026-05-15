'use client'

import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Play,
  Cog,
  ShieldCheck,
  FileCheck2,
  Loader2,
  CheckCircle2,
  XCircle,
  ChevronRight,
} from 'lucide-react'

// ===== Code Examples =====
const CODE_EXAMPLES: Record<string, string> = {
  circom: `pragma circom 2.1.0;

template Multiplier() {
  signal input a;
  signal input b;
  signal output c;
  
  c <== a * b;
}

component main = Multiplier();`,

  noir: `fn main(a: Field, b: Field) {
    let c = a * b;
    constrain c == a * b;
}`,

  solidity: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Verifier {
    function verifyProof(
        uint[2] memory a,
        uint[2][2] memory b,
        uint[2] memory c,
        uint[] memory input
    ) public view returns (bool) {
        // Verification logic
        return true;
    }
}`,

  typescript: `// ZK Proof Generation Example
import { groth16 } from "snarkjs";

async function generateProof(
  a: bigint,
  b: bigint
) {
  const { proof, publicSignals } = 
    await groth16.fullProve(
      { a, b },
      "circuit.wasm",
      "circuit_final.zkey"
    );
  
  return { proof, publicSignals };
}`,
}

// ===== Language to syntax highlighter language mapping =====
const LANG_MAP: Record<string, string> = {
  circom: 'cpp',
  noir: 'rust',
  solidity: 'solidity',
  typescript: 'typescript',
}

// ===== Simulated outputs =====
interface CompilationResult {
  success: boolean
  constraints: number
  privateInputs: number
  publicInputs: number
  outputs: number
  warnings: string[]
  time: string
}

interface ProofResult {
  proofSize: string
  publicSignals: string
  provingTime: string
  verificationTime: string
  protocol: string
  curve: string
}

function simulateCompilation(lang: string): CompilationResult {
  const configs: Record<string, CompilationResult> = {
    circom: {
      success: true,
      constraints: 1,
      privateInputs: 2,
      publicInputs: 0,
      outputs: 1,
      warnings: ['Circuit has no public inputs. Consider adding for verification.'],
      time: '0.342s',
    },
    noir: {
      success: true,
      constraints: 3,
      privateInputs: 2,
      publicInputs: 0,
      outputs: 1,
      warnings: [],
      time: '0.218s',
    },
    solidity: {
      success: true,
      constraints: 0,
      privateInputs: 0,
      publicInputs: 4,
      outputs: 1,
      warnings: ['Solidity verifier contract - no constraint generation.'],
      time: '0.089s',
    },
    typescript: {
      success: true,
      constraints: 1,
      privateInputs: 2,
      publicInputs: 1,
      outputs: 1,
      warnings: ['Ensure WASM and zkey files are in the public directory.'],
      time: '0.156s',
    },
  }
  return configs[lang] || configs.circom
}

function simulateProof(lang: string): ProofResult {
  const configs: Record<string, ProofResult> = {
    circom: {
      proofSize: '128 bytes',
      publicSignals: '1 (32 bytes)',
      provingTime: '~2.4s',
      verificationTime: '~5ms',
      protocol: 'Groth16',
      curve: 'BN254',
    },
    noir: {
      proofSize: '196 bytes',
      publicSignals: '1 (32 bytes)',
      provingTime: '~3.1s',
      verificationTime: '~8ms',
      protocol: 'UltraPlonk',
      curve: 'BN254',
    },
    solidity: {
      proofSize: '256 bytes',
      publicSignals: '4 (128 bytes)',
      provingTime: 'N/A (on-chain)',
      verificationTime: '~210k gas',
      protocol: 'Groth16 (Solidity verifier)',
      curve: 'BN254',
    },
    typescript: {
      proofSize: '128 bytes',
      publicSignals: '1 (32 bytes)',
      provingTime: '~2.8s',
      verificationTime: '~5ms',
      protocol: 'Groth16',
      curve: 'BN254',
    },
  }
  return configs[lang] || configs.circom
}

// ===== Line Numbers Component =====
function LineNumbers({ count }: { count: number }) {
  return (
    <div className="select-none text-right pr-3 pt-3 pb-3 text-[0.8rem] leading-[1.6] font-mono text-muted-foreground/50 shrink-0">
      {Array.from({ length: count }, (_, i) => (
        <div key={i + 1}>{i + 1}</div>
      ))}
    </div>
  )
}

// ===== Main Component =====
export default function PlaygroundSection() {
  const { playgroundLanguage, setPlaygroundLanguage, playgroundCode, setPlaygroundCode } = useAppStore()
  const [activeOutputTab, setActiveOutputTab] = useState('output')
  const [isCompiling, setIsCompiling] = useState(false)
  const [isGeneratingProof, setIsGeneratingProof] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [compilationResult, setCompilationResult] = useState<CompilationResult | null>(null)
  const [proofResult, setProofResult] = useState<ProofResult | null>(null)
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'success' | 'failed'>('idle')
  const [outputLog, setOutputLog] = useState<string[]>(['// Ready. Select a language and write your ZK circuit.'])
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const editorContainerRef = useRef<HTMLDivElement>(null)

  // Initialize code from store or examples
  const code = playgroundCode || CODE_EXAMPLES[playgroundLanguage] || CODE_EXAMPLES.circom

  useEffect(() => {
    setPlaygroundCode(CODE_EXAMPLES[playgroundLanguage] || CODE_EXAMPLES.circom)
  }, [playgroundLanguage, setPlaygroundCode])

  const handleLanguageChange = useCallback(
    (lang: string) => {
      setPlaygroundLanguage(lang as 'circom' | 'noir' | 'solidity' | 'typescript')
      setPlaygroundCode(CODE_EXAMPLES[lang] || CODE_EXAMPLES.circom)
      setCompilationResult(null)
      setProofResult(null)
      setVerificationStatus('idle')
      setOutputLog([`// Switched to ${lang.charAt(0).toUpperCase() + lang.slice(1)}`])
    },
    [setPlaygroundLanguage, setPlaygroundCode]
  )

  const handleCodeChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setPlaygroundCode(e.target.value)
    },
    [setPlaygroundCode]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Tab') {
        e.preventDefault()
        const textarea = e.currentTarget
        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const newCode = code.substring(0, start) + '  ' + code.substring(end)
        setPlaygroundCode(newCode)
        requestAnimationFrame(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 2
        })
      }
    },
    [code, setPlaygroundCode]
  )

  const handleCompile = useCallback(async () => {
    setIsCompiling(true)
    setActiveOutputTab('output')
    setOutputLog((prev) => [...prev, '', '> Compiling circuit...', `  Language: ${playgroundLanguage}`])

    await new Promise((r) => setTimeout(r, 1200))

    const result = simulateCompilation(playgroundLanguage)
    setCompilationResult(result)

    const logLines = [
      `  Parsing circuit definition... OK`,
      `  Analyzing constraints... ${result.constraints} found`,
      `  Checking signal assignments... OK`,
      result.warnings.length > 0 ? `  Warnings: ${result.warnings.length}` : '  No warnings',
      '',
      `  Compilation ${result.success ? 'successful' : 'failed'} in ${result.time}`,
      `  Constraints: ${result.constraints} | Private inputs: ${result.privateInputs} | Public inputs: ${result.publicInputs} | Outputs: ${result.outputs}`,
    ]
    setOutputLog((prev) => [...prev, ...logLines])
    setIsCompiling(false)
  }, [playgroundLanguage])

  const handleGenerateProof = useCallback(async () => {
    if (!compilationResult?.success) {
      setOutputLog((prev) => [...prev, '', '> Error: Compile the circuit first before generating a proof.'])
      setActiveOutputTab('output')
      return
    }

    setIsGeneratingProof(true)
    setActiveOutputTab('proof')
    setOutputLog((prev) => [...prev, '', '> Generating zero-knowledge proof...'])

    const steps = [
      '  Initializing proving system...',
      `  Protocol: Groth16 | Curve: BN254`,
      '  Computing witness...',
      '  Generating R1CS assignment...',
      '  Computing polynomial commitments...',
      '  Building proof elements [pi_a, pi_b, pi_c]...',
    ]

    for (let i = 0; i < steps.length; i++) {
      await new Promise((r) => setTimeout(r, 500))
      setOutputLog((prev) => [...prev, steps[i]])
    }

    await new Promise((r) => setTimeout(r, 800))
    const result = simulateProof(playgroundLanguage)
    setProofResult(result)
    setOutputLog((prev) => [
      ...prev,
      '',
      '  Proof generated successfully!',
      `  Proof size: ${result.proofSize}`,
      `  Public signals: ${result.publicSignals}`,
      `  Proving time: ${result.provingTime}`,
    ])
    setIsGeneratingProof(false)
  }, [compilationResult, playgroundLanguage])

  const handleVerify = useCallback(async () => {
    if (!proofResult) {
      setOutputLog((prev) => [...prev, '', '> Error: Generate a proof first before verification.'])
      setActiveOutputTab('output')
      return
    }

    setIsVerifying(true)
    setActiveOutputTab('output')
    setOutputLog((prev) => [...prev, '', '> Verifying proof...'])

    await new Promise((r) => setTimeout(r, 1500))

    const success = Math.random() > 0.15
    setVerificationStatus(success ? 'success' : 'failed')

    if (success) {
      setOutputLog((prev) => [
        ...prev,
        '  Validating proof against verification key...',
        '  Checking pairing equation e(A, B) = e(alpha, beta) * e(gamma, delta) * e(C, pub)...',
        '',
        `  Verification PASSED in ${proofResult.verificationTime}`,
        '  Proof is valid!',
      ])
    } else {
      setOutputLog((prev) => [
        ...prev,
        '  Validating proof against verification key...',
        '  Checking pairing equation...',
        '',
        '  Verification FAILED',
        '  Error: Proof does not satisfy the verification equation.',
      ])
    }
    setIsVerifying(false)
  }, [proofResult])

  const handleRun = useCallback(async () => {
    await handleCompile()
    if (compilationResult?.success) {
      await handleGenerateProof()
    }
  }, [handleCompile, handleGenerateProof, compilationResult])

  const lineCount = code.split('\n').length

  const syntaxLang = LANG_MAP[playgroundLanguage] || 'cpp'

  const constraintsDisplay = useMemo(() => {
    if (!compilationResult) return null
    return {
      total: compilationResult.constraints,
      linear: Math.ceil(compilationResult.constraints * 0.6),
      quadratic: Math.floor(compilationResult.constraints * 0.4),
      variables: compilationResult.privateInputs + compilationResult.publicInputs + compilationResult.outputs,
    }
  }, [compilationResult])

  return (
    <div className="flex flex-col h-full min-h-[600px] rounded-xl border border-zk-border bg-zk-surface overflow-hidden">
      {/* Header / Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-zk-border bg-zk-surface-hover/50">
        <div className="flex items-center gap-1.5">
          <div className="flex gap-1.5 mr-3">
            <div className="w-3 h-3 rounded-full bg-zk-rose/70" />
            <div className="w-3 h-3 rounded-full bg-zk-amber/70" />
            <div className="w-3 h-3 rounded-full bg-zk-emerald/70" />
          </div>
          <span className="text-sm font-medium text-muted-foreground mr-4">ZK Playground</span>

          {/* Language tabs */}
          <div className="flex items-center gap-0.5 bg-muted/50 rounded-md p-0.5">
            {(['circom', 'noir', 'solidity', 'typescript'] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => handleLanguageChange(lang)}
                className={`px-3 py-1 text-xs font-medium rounded transition-all ${
                  playgroundLanguage === lang
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {lang.charAt(0).toUpperCase() + lang.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleRun}
            disabled={isCompiling || isGeneratingProof || isVerifying}
            className="h-7 text-xs gap-1.5 text-zk-emerald hover:text-zk-emerald"
          >
            {isCompiling || isGeneratingProof || isVerifying ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Play className="size-3.5" />
            )}
            Run
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCompile}
            disabled={isCompiling}
            className="h-7 text-xs gap-1.5"
          >
            {isCompiling ? <Loader2 className="size-3.5 animate-spin" /> : <Cog className="size-3.5" />}
            Compile
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleGenerateProof}
            disabled={isGeneratingProof || !compilationResult?.success}
            className="h-7 text-xs gap-1.5 text-zk-violet hover:text-zk-violet"
          >
            {isGeneratingProof ? <Loader2 className="size-3.5 animate-spin" /> : <ShieldCheck className="size-3.5" />}
            Prove
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleVerify}
            disabled={isVerifying || !proofResult}
            className="h-7 text-xs gap-1.5 text-zk-cyan hover:text-zk-cyan"
          >
            {isVerifying ? <Loader2 className="size-3.5 animate-spin" /> : <FileCheck2 className="size-3.5" />}
            Verify
          </Button>
        </div>
      </div>

      {/* Editor + Output split */}
      <div className="flex flex-1 overflow-hidden">
        {/* Code Editor */}
        <div className="flex-1 flex flex-col min-w-0 border-r border-zk-border">
          <div className="flex items-center gap-2 px-3 py-1.5 border-b border-zk-border/50 bg-zk-surface-hover/30">
            <ChevronRight className="size-3.5 text-zk-violet" />
            <span className="text-xs text-muted-foreground font-mono">
              main.{playgroundLanguage === 'circom' ? 'circom' : playgroundLanguage === 'noir' ? 'nr' : playgroundLanguage === 'solidity' ? 'sol' : 'ts'}
            </span>
          </div>
          <div ref={editorContainerRef} className="flex flex-1 overflow-auto relative">
            <LineNumbers count={lineCount} />
            <div className="relative flex-1 min-w-0">
              {/* Syntax highlighted display */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <SyntaxHighlighter
                  language={syntaxLang}
                  style={oneDark}
                  customStyle={{
                    margin: 0,
                    padding: '12px 12px 12px 0',
                    background: 'transparent',
                    fontSize: '0.8rem',
                    lineHeight: '1.6',
                    fontFamily: 'var(--font-geist-mono), monospace',
                  }}
                  wrapLines={true}
                  lineProps={{ style: { whiteSpace: 'pre-wrap' } }}
                >
                  {code}
                </SyntaxHighlighter>
              </div>
              {/* Invisible textarea overlay */}
              <textarea
                ref={textareaRef}
                value={code}
                onChange={handleCodeChange}
                onKeyDown={handleKeyDown}
                spellCheck={false}
                className="absolute inset-0 w-full h-full resize-none bg-transparent text-transparent caret-zk-cyan outline-none p-3 pl-0 font-mono text-[0.8rem] leading-[1.6] whitespace-pre-wrap break-words"
                style={{
                  tabSize: 2,
                  caretColor: 'oklch(0.78 0.14 195)',
                }}
              />
            </div>
          </div>
        </div>

        {/* Output Panel */}
        <div className="w-[420px] flex flex-col min-w-0 bg-zk-surface/50">
          <Tabs value={activeOutputTab} onValueChange={setActiveOutputTab} className="flex flex-col h-full">
            <div className="flex items-center px-2 pt-1.5 border-b border-zk-border/50">
              <TabsList className="bg-transparent h-8 p-0 gap-0">
                <TabsTrigger
                  value="output"
                  className="rounded-b-none border-b-2 border-transparent data-[state=active]:border-zk-cyan data-[state=active]:bg-transparent data-[state=active]:shadow-none h-8 px-3 text-xs"
                >
                  Output
                </TabsTrigger>
                <TabsTrigger
                  value="constraints"
                  className="rounded-b-none border-b-2 border-transparent data-[state=active]:border-zk-amber data-[state=active]:bg-transparent data-[state=active]:shadow-none h-8 px-3 text-xs"
                >
                  Constraints
                </TabsTrigger>
                <TabsTrigger
                  value="proof"
                  className="rounded-b-none border-b-2 border-transparent data-[state=active]:border-zk-violet data-[state=active]:bg-transparent data-[state=active]:shadow-none h-8 px-3 text-xs"
                >
                  Proof
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="output" className="flex-1 overflow-auto m-0 p-0">
              <div className="p-3 font-mono text-xs leading-relaxed">
                <AnimatePresence mode="popLayout">
                  {outputLog.map((line, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.15 }}
                      className={`py-0.5 ${
                        line.startsWith('>')
                          ? 'text-zk-cyan font-semibold'
                          : line.includes('successful') || line.includes('PASSED') || line.includes('valid!')
                          ? 'text-zk-emerald'
                          : line.includes('FAILED') || line.includes('Error')
                          ? 'text-zk-rose'
                          : line.includes('Warning')
                          ? 'text-zk-amber'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {line || '\u00A0'}
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Verification status indicator */}
                <AnimatePresence>
                  {verificationStatus !== 'idle' && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className={`mt-4 p-3 rounded-lg border ${
                        verificationStatus === 'success'
                          ? 'bg-zk-emerald/10 border-zk-emerald/30'
                          : 'bg-zk-rose/10 border-zk-rose/30'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {verificationStatus === 'success' ? (
                          <CheckCircle2 className="size-4 text-zk-emerald" />
                        ) : (
                          <XCircle className="size-4 text-zk-rose" />
                        )}
                        <span
                          className={`text-sm font-medium ${
                            verificationStatus === 'success' ? 'text-zk-emerald' : 'text-zk-rose'
                          }`}
                        >
                          {verificationStatus === 'success' ? 'Proof Verified Successfully' : 'Proof Verification Failed'}
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </TabsContent>

            <TabsContent value="constraints" className="flex-1 overflow-auto m-0 p-0">
              <div className="p-3">
                <AnimatePresence>
                  {compilationResult ? (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                      <div className="text-xs text-muted-foreground mb-3">
                        R1CS Constraint Summary
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { label: 'Total Constraints', value: compilationResult.constraints, color: 'text-zk-violet' },
                          { label: 'Variables', value: constraintsDisplay?.variables || 0, color: 'text-zk-cyan' },
                          { label: 'Private Inputs', value: compilationResult.privateInputs, color: 'text-zk-emerald' },
                          { label: 'Public Inputs', value: compilationResult.publicInputs, color: 'text-zk-amber' },
                          { label: 'Outputs', value: compilationResult.outputs, color: 'text-zk-rose' },
                          { label: 'Compile Time', value: compilationResult.time, color: 'text-muted-foreground' },
                        ].map((item) => (
                          <div key={item.label} className="bg-zk-surface-hover/50 rounded-md p-2.5 border border-zk-border/30">
                            <div className="text-[0.65rem] text-muted-foreground/70 mb-1">{item.label}</div>
                            <div className={`text-sm font-semibold font-mono ${item.color}`}>{item.value}</div>
                          </div>
                        ))}
                      </div>

                      {compilationResult.warnings.length > 0 && (
                        <div className="mt-3 p-2.5 rounded-md bg-zk-amber/5 border border-zk-amber/20">
                          <div className="text-[0.7rem] font-medium text-zk-amber mb-1">Warnings</div>
                          {compilationResult.warnings.map((w, i) => (
                            <div key={i} className="text-[0.7rem] text-zk-amber/70 font-mono">{w}</div>
                          ))}
                        </div>
                      )}

                      {/* Constraint visualization */}
                      <div className="mt-3 p-2.5 rounded-md bg-zk-surface-hover/30 border border-zk-border/20">
                        <div className="text-[0.7rem] text-muted-foreground/70 mb-2">Constraint Types</div>
                        <div className="space-y-1.5">
                          {[
                            { label: 'Linear', count: constraintsDisplay?.linear || 0, pct: 60, color: 'bg-zk-cyan' },
                            { label: 'Quadratic', count: constraintsDisplay?.quadratic || 0, pct: 40, color: 'bg-zk-violet' },
                          ].map((item) => (
                            <div key={item.label} className="flex items-center gap-2">
                              <span className="text-[0.65rem] text-muted-foreground w-16">{item.label}</span>
                              <div className="flex-1 h-1.5 bg-muted/50 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${item.pct}%` }}
                                  transition={{ duration: 0.8, ease: 'easeOut' }}
                                  className={`h-full rounded-full ${item.color}`}
                                />
                              </div>
                              <span className="text-[0.65rem] text-muted-foreground font-mono w-8 text-right">{item.count}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center justify-center py-12 text-muted-foreground/50"
                    >
                      <Cog className="size-8 mb-2 opacity-40" />
                      <div className="text-xs">Compile a circuit to view constraints</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </TabsContent>

            <TabsContent value="proof" className="flex-1 overflow-auto m-0 p-0">
              <div className="p-3">
                <AnimatePresence>
                  {proofResult ? (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                      <div className="text-xs text-muted-foreground mb-3">
                        Proof Details
                      </div>
                      <div className="space-y-2">
                        {[
                          { label: 'Protocol', value: proofResult.protocol, color: 'text-zk-violet' },
                          { label: 'Curve', value: proofResult.curve, color: 'text-zk-cyan' },
                          { label: 'Proof Size', value: proofResult.proofSize, color: 'text-zk-emerald' },
                          { label: 'Public Signals', value: proofResult.publicSignals, color: 'text-zk-amber' },
                          { label: 'Proving Time', value: proofResult.provingTime, color: 'text-muted-foreground' },
                          { label: 'Verification Time', value: proofResult.verificationTime, color: 'text-zk-emerald' },
                        ].map((item) => (
                          <div key={item.label} className="flex items-center justify-between py-1.5 px-2.5 bg-zk-surface-hover/30 rounded-md border border-zk-border/20">
                            <span className="text-[0.7rem] text-muted-foreground/70">{item.label}</span>
                            <span className={`text-xs font-mono font-medium ${item.color}`}>{item.value}</span>
                          </div>
                        ))}
                      </div>

                      {/* Proof structure visualization */}
                      <div className="mt-3 p-3 rounded-md bg-zk-violet/5 border border-zk-violet/20">
                        <div className="text-[0.7rem] font-medium text-zk-violet mb-2">Proof Structure (Groth16)</div>
                        <div className="font-mono text-[0.65rem] text-muted-foreground space-y-1">
                          <div>pi_a = [0x3f2a..., 0x8b1c...]</div>
                          <div>pi_b = [[0xd47e..., 0x12a9...], [0x7c3f..., 0xe51b...]]</div>
                          <div>pi_c = [0xa29d..., 0x5f07...]</div>
                        </div>
                      </div>

                      {/* Verification key */}
                      <div className="p-3 rounded-md bg-zk-surface-hover/30 border border-zk-border/20">
                        <div className="text-[0.7rem] font-medium text-muted-foreground mb-2">Verification Key</div>
                        <div className="font-mono text-[0.65rem] text-muted-foreground/70 space-y-1">
                          <div>alpha_g1 = [0x1e7a..., 0x4b3c...]</div>
                          <div>beta_g2 = [[0xf891..., 0x2d4e...], ...]</div>
                          <div>gamma_g2 = [[0xc3a7..., 0x6b0f...], ...]</div>
                          <div>delta_g2 = [[0x9e2d..., 0xa154...], ...]</div>
                          <div className="text-muted-foreground/40">IC[0..n] = ...</div>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center justify-center py-12 text-muted-foreground/50"
                    >
                      <ShieldCheck className="size-8 mb-2 opacity-40" />
                      <div className="text-xs">Generate a proof to view details</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
