'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, X, Send } from 'lucide-react'
import { useAppStore, type TutorMessage } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'

const ZK_RESPONSES: Record<string, string> = {
  zksnark: `A zkSNARK (Zero-Knowledge Succinct Non-Interactive Argument of Knowledge) is a proof system that allows one party (the prover) to convince another party (the verifier) that a statement is true, without revealing any information beyond the validity of the statement itself.

Key properties:
\u2022 Succinct: The proof is extremely small (typically ~192 bytes for Groth16) and fast to verify (milliseconds), regardless of the complexity of the computation being proved.
\u2022 Non-interactive: The proof is a single message from prover to verifier. No back-and-forth communication is required, thanks to the Fiat-Shamir heuristic which replaces interactive challenges with hash-based ones.
\u2022 Argument of Knowledge: It is computationally sound (not information-theoretically sound) — a polynomial-time prover cannot forge a proof, assuming cryptographic assumptions hold.

zkSNARKs require a trusted setup ceremony to generate structured reference strings. If the secret randomness ("toxic waste") used in the setup is not properly destroyed, it could be used to forge proofs. Despite this, they remain the most widely deployed ZK proof system in production, powering Zcash, Tornado Cash, zkSync, and many other systems.`,

  merkle: `A Merkle tree is a binary tree data structure where every leaf node is the hash of a data element, and every non-leaf node is the hash of its two children. The root of the tree — the Merkle root — is a single hash that commits to the entire dataset.

How they work:
\u2022 Start with your data items and hash each one to create the leaf nodes.
\u2022 Pair up adjacent hashes and hash each pair together to create the next level up.
\u2022 Continue this process until you reach a single root hash.

Why they matter in ZK:
\u2022 Membership proofs: To prove that a specific element is in the tree, you only need log\u2082(n) sibling hashes (a "Merkle proof"), not the entire tree.
\u2022 Privacy: A ZK proof of Merkle membership lets you prove "my data is in this tree" without revealing which leaf is yours. This is the foundation of privacy in Zcash and ZK identity systems.
\u2022 Efficiency: A tree with 1 billion leaves requires only ~30 hashes per proof. This logarithmic scaling is what makes Merkle trees essential for blockchain scalability.`,

  r1cs: `R1CS (Rank-1 Constraint System) is the arithmetic constraint system used by Groth16, Pinocchio, and many other SNARK systems. It represents a computation as a set of bilinear constraints over a finite field.

Formally, each constraint has the form:
  (a\u20D7 \u00B7 s\u20D7) \u00D7 (b\u20D7 \u00B7 s\u20D7) = (c\u20D7 \u00B7 s\u20D7)

Where a\u20D7, b\u20D7, c\u20D7 are coefficient vectors and s\u20D7 is the witness vector containing all values (inputs, intermediate computations, and outputs).

Key properties:
\u2022 Each constraint captures exactly one multiplication — this is the "rank-1" in the name.
\u2022 Additions are "free" — they can be folded into linear combinations within a constraint.
\u2022 The number of constraints equals the number of multiplication gates in the arithmetic circuit.
\u2022 R1CS is converted to a QAP (Quadratic Arithmetic Program) via Lagrange interpolation, which is then used in the proof generation.

Example: Computing x\u00B3 + x + 5 requires 2 R1CS constraints (one for x\u00B2, one for x\u00B3), since addition does not need separate constraints.`,

  groth16: `Groth16 is the most widely deployed zkSNARK proving system, introduced by Jens Groth in 2016. It produces the smallest proofs and fastest verification of any known SNARK.

Key characteristics:
\u2022 Proof size: Just 3 group elements (~192 bytes on the BN254 curve). This is constant regardless of circuit size.
\u2022 Verification time: ~1-3ms, requiring only 3 pairing operations. Also constant regardless of computation complexity.
\u2022 Trusted setup: Requires a circuit-specific trusted setup ceremony (per-circuit SRS). This is the main drawback — each new circuit needs its own ceremony.
\u2022 Proving time: O(n) where n is the number of constraints. Typically seconds for circuits with millions of gates.

The proof consists of three elliptic curve points (A, B, C) and verification checks the pairing equation: e(A, B) = e(\u03B1, \u03B2) \u00B7 e(\u03B3, C) \u00B7 e(\u03B4, public_input_commitment).

Groth16 is used in production by Zcash, Tornado Cash, Filecoin, and many Ethereum-based systems. The per-circuit trusted setup remains its primary limitation — which is why universal setup systems like PLONK have gained popularity.`,

  trustedsetup: `A trusted setup is a one-time cryptographic ceremony that generates the public parameters (Structured Reference String / SRS) needed by SNARK proof systems like Groth16.

How it works:
\u2022 The setup produces cryptographic values derived from secret random numbers (often called "toxic waste").
\u2022 These values encode powers of a secret \u03C4 as encrypted elliptic curve points: [1], [\u03C4], [\u03C4\u00B2], ..., [\u03C4^d].
\u2022 The prover uses these to evaluate and commit to polynomials without knowing \u03C4 itself.
\u2022 The verifier uses them to check pairing equations that would only hold if the prover's polynomials are consistent.

The security requirement:
\u2022 If any single participant in the ceremony honestly destroys their secret contribution, the resulting parameters are secure.
\u2022 If ALL participants collude and combine their secrets, they could forge proofs.
\u2022 This is called the "trust assumption" — you trust that at least one participant was honest.

Types of setup:
\u2022 Per-circuit: Groth16 requires a new ceremony for each circuit (limitation).
\u2022 Universal: PLONK with KZG uses a single ceremony for all circuits up to a maximum size.
\u2022 Transparent: STARKs and Halo2 require no trusted setup at all — they use only hash functions for commitments.`,
}

function getLocalResponse(input: string): string {
  const normalized = input.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim()

  if (normalized.includes('zksnark') || normalized.includes('zk snark') || normalized.includes('snark')) {
    return ZK_RESPONSES.zksnark
  }
  if (normalized.includes('merkle')) {
    return ZK_RESPONSES.merkle
  }
  if (normalized.includes('r1cs') || normalized.includes('rank 1') || normalized.includes('rank1')) {
    return ZK_RESPONSES.r1cs
  }
  if (normalized.includes('groth16') || normalized.includes('groth')) {
    return ZK_RESPONSES.groth16
  }
  if (normalized.includes('trusted setup') || normalized.includes('setup ceremony') || normalized.includes('trusted setup')) {
    return ZK_RESPONSES.trustedsetup
  }

  return `That's a great question about ZK proofs. To explore this topic in depth, check out the relevant lesson in our curriculum. The key intuition is that zero knowledge proofs allow us to prove the truth of a statement without revealing any information beyond the statement's validity. This is achieved through a careful interplay of cryptographic commitments, challenge-response protocols, and algebraic properties over finite fields.

Feel free to ask me about specific topics like zkSNARKs, Merkle trees, R1CS, Groth16, or trusted setups for more detailed explanations.`
}

function RelativeTime({ timestamp }: { timestamp: number }) {
  const now = Date.now()
  const diff = now - timestamp
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)

  if (seconds < 10) return <span className="text-muted-foreground/60">just now</span>
  if (seconds < 60) return <span className="text-muted-foreground/60">{seconds}s ago</span>
  if (minutes < 60) return <span className="text-muted-foreground/60">{minutes}m ago</span>
  return <span className="text-muted-foreground/60">{new Date(timestamp).toLocaleTimeString()}</span>
}

function TypingMessage({ content }: { content: string }) {
  const [displayState, setDisplayState] = useState({ chars: 0, complete: content.length === 0 })

  useEffect(() => {
    let chars = 0
    let done = false

    if (content.length === 0) {
      return
    }

    const charsPerTick = 3
    const interval = setInterval(() => {
      chars += charsPerTick
      if (chars >= content.length) {
        chars = content.length
        done = true
        clearInterval(interval)
      }
      setDisplayState({ chars, complete: done })
    }, 15)

    return () => clearInterval(interval)
  }, [content])

  return (
    <div className="whitespace-pre-wrap text-sm leading-relaxed">
      {content.slice(0, displayState.chars)}
      {!displayState.complete && (
        <motion.span
          className="inline-block w-0.5 h-4 bg-zk-violet ml-0.5 align-middle"
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        />
      )}
    </div>
  )
}

function ChatMessage({ message, isLatestAssistant }: { message: TutorMessage; isLatestAssistant: boolean }) {
  const isUser = message.role === 'user'

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`max-w-[85%] ${isUser ? 'order-2' : 'order-1'}`}>
        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? 'bg-zk-violet/20 border border-zk-violet/30 text-foreground'
              : 'bg-card border border-border text-card-foreground'
          }`}
        >
          {isLatestAssistant && !isUser ? (
            <TypingMessage content={message.content} />
          ) : (
            <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</div>
          )}
        </div>
        <div className={`mt-1 text-[10px] ${isUser ? 'text-right' : 'text-left'}`}>
          <RelativeTime timestamp={message.timestamp} />
        </div>
      </div>
    </motion.div>
  )
}

const WELCOME_MESSAGE: TutorMessage = {
  id: 'welcome',
  role: 'assistant',
  content: `Welcome to ZK Mentor! I'm here to help you understand zero knowledge proofs, cryptographic primitives, and the mathematics behind them.

You can ask me about topics like:
\u2022 zkSNARKs and how they work
\u2022 Merkle trees and membership proofs
\u2022 R1CS constraint systems
\u2022 Groth16 proving system
\u2022 Trusted setup ceremonies

What would you like to learn about?`,
  timestamp: Date.now(),
}

export default function AITutorPanel() {
  const { tutorOpen, setTutorOpen, tutorMessages, addTutorMessage } = useAppStore()
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const messages = tutorMessages.length > 0 ? tutorMessages : [WELCOME_MESSAGE]

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      const viewport = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight
      }
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  useEffect(() => {
    if (tutorOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [tutorOpen])

  const handleSend = useCallback(() => {
    const trimmed = input.trim()
    if (!trimmed || isTyping) return

    const userMessage: TutorMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: Date.now(),
    }

    addTutorMessage(userMessage)
    setInput('')
    setIsTyping(true)

    setTimeout(() => {
      const response = getLocalResponse(trimmed)
      const assistantMessage: TutorMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
      }
      addTutorMessage(assistantMessage)
      setIsTyping(false)
    }, 600 + Math.random() * 800)
  }, [input, isTyping, addTutorMessage])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
    },
    [handleSend]
  )

  const latestAssistantId = [...messages].reverse().find(m => m.role === 'assistant')?.id

  return (
    <>
      {/* Floating trigger button */}
      <AnimatePresence>
        {!tutorOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            onClick={() => setTutorOpen(true)}
            className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-12 h-12 rounded-full bg-zk-violet/20 border border-zk-violet/30 hover:bg-zk-violet/30 transition-colors shadow-lg cursor-pointer"
            aria-label="Open ZK Mentor"
          >
            <MessageSquare className="w-5 h-5 text-zk-violet" />
            <motion.div
              className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-zk-emerald border-2 border-background"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Slide-in panel */}
      <AnimatePresence>
        {tutorOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
              onClick={() => setTutorOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 z-50 h-full w-full sm:w-[420px] bg-background border-l border-border flex flex-col shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-zk-violet/15 border border-zk-violet/25">
                    <MessageSquare className="w-4 h-4 text-zk-violet" />
                    <motion.div
                      className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-zk-emerald border-2 border-background"
                      animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-foreground">ZK Mentor</h2>
                    <p className="text-[11px] text-muted-foreground">Ask me anything about ZK proofs</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTutorOpen(false)}
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Messages */}
              <ScrollArea ref={scrollRef} className="flex-1 px-4 py-4">
                <div className="space-y-4">
                  {messages.map(message => (
                    <ChatMessage
                      key={message.id}
                      message={message}
                      isLatestAssistant={message.id === latestAssistantId}
                    />
                  ))}
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-start"
                    >
                      <div className="bg-card border border-border rounded-2xl px-4 py-3">
                        <div className="flex gap-1.5">
                          {[0, 1, 2].map(i => (
                            <motion.div
                              key={i}
                              className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50"
                              animate={{ y: [0, -4, 0] }}
                              transition={{
                                duration: 0.6,
                                repeat: Infinity,
                                delay: i * 0.15,
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </ScrollArea>

              {/* Input area */}
              <div className="border-t border-border px-4 py-3">
                <div className="flex items-end gap-2">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about ZK proofs..."
                    rows={1}
                    className="flex-1 resize-none rounded-xl bg-muted/50 border border-border px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-zk-violet/30 focus:border-zk-violet/50 transition-all min-h-[40px] max-h-[120px]"
                    style={{
                      height: 'auto',
                      overflow: 'hidden',
                    }}
                    onInput={e => {
                      const target = e.target as HTMLTextAreaElement
                      target.style.height = 'auto'
                      target.style.height = Math.min(target.scrollHeight, 120) + 'px'
                    }}
                  />
                  <Button
                    onClick={handleSend}
                    disabled={!input.trim() || isTyping}
                    size="icon"
                    className="h-10 w-10 rounded-xl bg-zk-violet hover:bg-zk-violet/80 text-primary-foreground shrink-0 disabled:opacity-40"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                <p className="mt-2 text-[10px] text-muted-foreground/40 text-center">
                  Enter to send, Shift+Enter for new line
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
