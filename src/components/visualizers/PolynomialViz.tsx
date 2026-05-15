'use client'

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

function djb2Hash(str: string): string {
  let hash = 5381
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i)
    hash = hash & hash
  }
  return Math.abs(hash).toString(16).padStart(8, '0').slice(0, 8)
}

function evaluatePolynomial(coeffs: number[], x: number): number {
  let result = 0
  for (let i = 0; i < coeffs.length; i++) {
    result += coeffs[i] * Math.pow(x, i)
  }
  return result
}

function formatPoly(coeffs: number[]): string {
  const terms: string[] = []
  for (let i = coeffs.length - 1; i >= 0; i--) {
    const c = coeffs[i]
    if (Math.abs(c) < 0.01) continue
    let term = ''
    if (i === 0) {
      term = c >= 0 ? `${c.toFixed(1)}` : `${c.toFixed(1)}`
    } else if (i === 1) {
      const absC = Math.abs(c)
      const sign = c >= 0 ? '' : '-'
      term = absC === 1 ? `${sign}x` : `${sign}${absC.toFixed(1)}x`
    } else {
      const absC = Math.abs(c)
      const sign = c >= 0 ? '' : '-'
      term = absC === 1 ? `${sign}x^${i}` : `${sign}${absC.toFixed(1)}x^${i}`
    }
    terms.push(term)
  }
  if (terms.length === 0) return '0'
  let result = terms[0]
  for (let i = 1; i < terms.length; i++) {
    const t = terms[i]
    if (t.startsWith('-')) {
      result += ` - ${t.slice(1)}`
    } else {
      result += ` + ${t}`
    }
  }
  return result || '0'
}

function lagrangeInterpolation(points: { x: number; y: number }[]): number[] {
  const n = points.length
  const coeffs = new Array(n).fill(0)

  for (let i = 0; i < n; i++) {
    const basisCoeffs = new Array(n).fill(0)
    basisCoeffs[0] = points[i].y

    for (let j = 0; j < n; j++) {
      if (i === j) continue
      const denom = points[i].x - points[j].x
      for (let k = n - 1; k >= 0; k--) {
        basisCoeffs[k] = basisCoeffs[k] / denom
        if (k > 0) basisCoeffs[k] -= basisCoeffs[k - 1] / denom
      }
    }

    for (let k = 0; k < n; k++) {
      coeffs[k] += basisCoeffs[k]
    }
  }

  return coeffs
}

export default function PolynomialViz() {
  const svgRef = useRef<SVGSVGElement>(null)
  const [degree, setDegree] = useState(3)
  const [coeffs, setCoeffs] = useState<number[]>([0, 1, 0, 0.3])
  const [controlPoints, setControlPoints] = useState<{ x: number; y: number }[]>([
    { x: -3, y: 0 },
    { x: -1, y: -1 },
    { x: 1, y: 1 },
    { x: 3, y: 0 },
  ])
  const [useControlPoints, setUseControlPoints] = useState(true)
  const [draggingPoint, setDraggingPoint] = useState<number | null>(null)
  const [challengePoint, setChallengePoint] = useState<number | null>(null)
  const [showCommitment, setShowCommitment] = useState(false)
  const [verifyAnim, setVerifyAnim] = useState(false)
  const [verifyStep, setVerifyStep] = useState(0)

  const svgW = 600
  const svgH = 420
  const margin = 40
  const xRange = [-5, 5]
  const yRange = [-8, 8]

  const toSvgX = useCallback(
    (x: number) => margin + ((x - xRange[0]) / (xRange[1] - xRange[0])) * (svgW - 2 * margin),
    []
  )
  const toSvgY = useCallback(
    (y: number) => svgH - margin - ((y - yRange[0]) / (yRange[1] - yRange[0])) * (svgH - 2 * margin),
    []
  )
  const fromSvgX = useCallback(
    (sx: number) => xRange[0] + ((sx - margin) / (svgW - 2 * margin)) * (xRange[1] - xRange[0]),
    []
  )

  const activeControlPoints = useMemo(() => {
    const prev = controlPoints
    if (prev.length === degree + 1) return prev
    if (prev.length < degree + 1) {
      const newPts = [...prev]
      while (newPts.length < degree + 1) {
        const i = newPts.length
        newPts.push({ x: -4 + (8 * i) / degree, y: Math.sin(i) * 2 })
      }
      return newPts
    }
    return prev.slice(0, degree + 1)
  }, [controlPoints, degree])

  const activeCoeffs = useMemo(() => {
    if (useControlPoints) {
      return lagrangeInterpolation(activeControlPoints.slice(0, degree + 1))
    }
    return coeffs.slice(0, degree + 1)
  }, [useControlPoints, activeControlPoints, coeffs, degree])

  const evalResult = useMemo(() => {
    if (challengePoint === null) return null
    return evaluatePolynomial(activeCoeffs, challengePoint)
  }, [activeCoeffs, challengePoint])

  const commitment = useMemo(() => {
    return djb2Hash(activeCoeffs.map((c) => c.toFixed(4)).join(','))
  }, [activeCoeffs])

  const handleChallenge = useCallback(() => {
    const pt = parseFloat((Math.random() * 8 - 4).toFixed(1))
    setChallengePoint(pt)
    setShowCommitment(true)
    setVerifyAnim(false)
    setVerifyStep(0)
  }, [])

  const handleVerify = useCallback(() => {
    setVerifyAnim(true)
    setVerifyStep(1)
    setTimeout(() => setVerifyStep(2), 800)
    setTimeout(() => setVerifyStep(3), 1600)
  }, [])

  const reset = useCallback(() => {
    setChallengePoint(null)
    setShowCommitment(false)
    setVerifyAnim(false)
    setVerifyStep(0)
  }, [])

  // Drag handling
  const handleMouseDown = useCallback(
    (idx: number, e: React.MouseEvent) => {
      if (!useControlPoints) return
      e.preventDefault()
      setDraggingPoint(idx)
    },
    [useControlPoints]
  )

  useEffect(() => {
    if (draggingPoint === null) return
    const svg = svgRef.current
    if (!svg) return

    const handleMouseMove = (e: MouseEvent) => {
      const rect = svg.getBoundingClientRect()
      const sx = ((e.clientX - rect.left) / rect.width) * svgW
      const x = fromSvgX(sx)
      const clampedX = Math.max(-4.5, Math.min(4.5, parseFloat(x.toFixed(1))))
      setControlPoints((prev) => {
        const next = [...prev]
        next[draggingPoint] = { ...next[draggingPoint], x: clampedX }
        return next
      })
    }

    const handleMouseUp = () => {
      setDraggingPoint(null)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [draggingPoint, fromSvgX, svgW])

  // Generate curve path
  const curvePath = useMemo(() => {
    const points: string[] = []
    for (let px = 0; px <= svgW - 2 * margin; px++) {
      const x = xRange[0] + (px / (svgW - 2 * margin)) * (xRange[1] - xRange[0])
      const y = evaluatePolynomial(activeCoeffs, x)
      if (y < yRange[0] - 2 || y > yRange[1] + 2) continue
      const sx = toSvgX(x)
      const sy = toSvgY(y)
      points.push(`${points.length === 0 ? 'M' : 'L'} ${sx} ${sy}`)
    }
    return points.join(' ')
  }, [activeCoeffs, svgW, svgH, margin, toSvgX, toSvgY])

  return (
    <div className="flex flex-col lg:flex-row gap-4 w-full">
      <div className="flex-1 min-w-0">
        {/* Commitment display */}
        <AnimatePresence>
          {showCommitment && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-3 p-3 rounded-lg bg-zk-surface border border-zk-border flex items-center gap-3"
            >
              <div className="text-xs text-muted-foreground">Commitment:</div>
              <div className="font-mono text-sm text-zk-amber tracking-wider">{commitment}</div>
              {challengePoint !== null && (
                <div className="text-xs text-muted-foreground ml-auto">
                  Challenge: <span className="text-zk-cyan font-mono">x = {challengePoint}</span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="rounded-xl border border-zk-border overflow-hidden bg-zk-surface p-2">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${svgW} ${svgH}`}
            className="w-full"
            style={{ maxHeight: '420px' }}
          >
            {/* Grid */}
            {Array.from({ length: 11 }, (_, i) => {
              const x = -5 + i
              return (
                <line
                  key={`gx-${i}`}
                  x1={toSvgX(x)}
                  y1={margin}
                  x2={toSvgX(x)}
                  y2={svgH - margin}
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth={1}
                />
              )
            })}
            {Array.from({ length: 17 }, (_, i) => {
              const y = -8 + i
              return (
                <line
                  key={`gy-${i}`}
                  x1={margin}
                  y1={toSvgY(y)}
                  x2={svgW - margin}
                  y2={toSvgY(y)}
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth={1}
                />
              )
            })}

            {/* Axes */}
            <line
              x1={margin}
              y1={toSvgY(0)}
              x2={svgW - margin}
              y2={toSvgY(0)}
              stroke="rgba(255,255,255,0.2)"
              strokeWidth={1}
            />
            <line
              x1={toSvgX(0)}
              y1={margin}
              x2={toSvgX(0)}
              y2={svgH - margin}
              stroke="rgba(255,255,255,0.2)"
              strokeWidth={1}
            />

            {/* Axis labels */}
            {[-4, -2, 2, 4].map((x) => (
              <text
                key={`lx-${x}`}
                x={toSvgX(x)}
                y={toSvgY(0) + 14}
                textAnchor="middle"
                fill="rgba(255,255,255,0.3)"
                fontSize={10}
                fontFamily="monospace"
              >
                {x}
              </text>
            ))}
            {[-6, -4, -2, 2, 4, 6].map((y) => (
              <text
                key={`ly-${y}`}
                x={toSvgX(0) - 8}
                y={toSvgY(y) + 3}
                textAnchor="end"
                fill="rgba(255,255,255,0.3)"
                fontSize={10}
                fontFamily="monospace"
              >
                {y}
              </text>
            ))}

            {/* Polynomial curve */}
            <motion.path
              d={curvePath}
              fill="none"
              stroke="#a78bfa"
              strokeWidth={2.5}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5 }}
            />

            {/* Control points */}
            {useControlPoints &&
              activeControlPoints.slice(0, degree + 1).map((pt, i) => {
                const sx = toSvgX(pt.x)
                const sy = toSvgY(evaluatePolynomial(activeCoeffs, pt.x))
                return (
                  <g key={`cp-${i}`}>
                    <circle
                      cx={sx}
                      cy={sy}
                      r={6}
                      fill="rgba(167,139,250,0.3)"
                      stroke="#a78bfa"
                      strokeWidth={1.5}
                      className="cursor-grab active:cursor-grabbing"
                      onMouseDown={(e) => handleMouseDown(i, e as unknown as React.MouseEvent)}
                    />
                    <text
                      x={sx + 10}
                      y={sy - 8}
                      fill="#a78bfa"
                      fontSize={9}
                      fontFamily="monospace"
                    >
                      ({pt.x.toFixed(1)})
                    </text>
                  </g>
                )
              })}

            {/* Challenge evaluation */}
            {challengePoint !== null && evalResult !== null && (
              <g>
                {/* Vertical line */}
                <motion.line
                  x1={toSvgX(challengePoint)}
                  y1={toSvgY(0)}
                  x2={toSvgX(challengePoint)}
                  y2={toSvgY(evalResult)}
                  stroke="#22d3ee"
                  strokeWidth={1.5}
                  strokeDasharray="4 3"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5 }}
                />
                {/* Horizontal line to y-axis */}
                <motion.line
                  x1={toSvgX(0)}
                  y1={toSvgY(evalResult)}
                  x2={toSvgX(challengePoint)}
                  y2={toSvgY(evalResult)}
                  stroke="#22d3ee"
                  strokeWidth={1}
                  strokeDasharray="3 3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5 }}
                  transition={{ delay: 0.3 }}
                />
                {/* Evaluation point */}
                <motion.circle
                  cx={toSvgX(challengePoint)}
                  cy={toSvgY(evalResult)}
                  r={6}
                  fill="#22d3ee"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.3 }}
                />
                <motion.text
                  x={toSvgX(challengePoint) + 10}
                  y={toSvgY(evalResult) - 6}
                  fill="#22d3ee"
                  fontSize={10}
                  fontFamily="monospace"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  f({challengePoint}) = {evalResult.toFixed(2)}
                </motion.text>

                {/* Verify animation */}
                {verifyAnim && verifyStep >= 2 && (
                  <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <text
                      x={svgW / 2}
                      y={30}
                      textAnchor="middle"
                      fill="#34d399"
                      fontSize={12}
                      fontFamily="monospace"
                    >
                      Evaluating at x = {challengePoint}: f({challengePoint}) = {evalResult.toFixed(2)}
                    </text>
                  </motion.g>
                )}
                {verifyAnim && verifyStep >= 3 && (
                  <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                    <text
                      x={svgW / 2}
                      y={48}
                      textAnchor="middle"
                      fill="#fbbf24"
                      fontSize={11}
                      fontFamily="monospace"
                    >
                      ✓ Commitment verified: hash matches
                    </text>
                  </motion.g>
                )}
              </g>
            )}
          </svg>
        </div>

        {/* Equation display */}
        <div className="mt-3 p-3 rounded-lg bg-zk-surface border border-zk-border font-mono text-sm">
          <span className="text-zk-violet">f(x) = {formatPoly(activeCoeffs)}</span>
          {useControlPoints && (
            <span className="text-muted-foreground text-xs ml-2">(Lagrange interpolation)</span>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="w-full lg:w-56 space-y-4">
        <div className="p-4 rounded-xl bg-zk-surface border border-zk-border space-y-3">
          <h3 className="text-sm font-semibold text-zk-violet">Degree</h3>
          <div className="flex flex-wrap gap-1">
            {[1, 2, 3, 4, 5, 6].map((d) => (
              <Badge
                key={d}
                variant={degree === d ? 'default' : 'outline'}
                className="cursor-pointer text-xs"
                onClick={() => {
                  setDegree(d)
                  setCoeffs((prev) => {
                    if (prev.length > d + 1) return prev.slice(0, d + 1)
                    const next = [...prev]
                    while (next.length < d + 1) next.push(0)
                    return next
                  })
                  reset()
                }}
              >
                {d}
              </Badge>
            ))}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-zk-surface border border-zk-border space-y-3">
          <h3 className="text-sm font-semibold text-zk-violet">Input Mode</h3>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={useControlPoints ? 'default' : 'outline'}
              onClick={() => setUseControlPoints(true)}
              className="flex-1 text-xs"
            >
              Drag Points
            </Button>
            <Button
              size="sm"
              variant={!useControlPoints ? 'default' : 'outline'}
              onClick={() => setUseControlPoints(false)}
              className="flex-1 text-xs"
            >
              Coefficients
            </Button>
          </div>
          {!useControlPoints && (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {coeffs.slice(0, degree + 1).map((c, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-8 font-mono">a{i}=</span>
                  <input
                    type="number"
                    value={c}
                    step={0.1}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0
                      setCoeffs((prev) => {
                        const next = [...prev]
                        next[i] = val
                        return next
                      })
                    }}
                    className="w-20 bg-zk-surface-hover border border-zk-border rounded px-2 py-1 text-xs font-mono text-foreground"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 rounded-xl bg-zk-surface border border-zk-border space-y-3">
          <h3 className="text-sm font-semibold text-zk-violet">Commitment</h3>
          <Button
            size="sm"
            onClick={handleChallenge}
            className="w-full text-xs bg-zk-cyan text-black hover:bg-zk-cyan/80"
          >
            Random Challenge
          </Button>
          {showCommitment && challengePoint !== null && (
            <Button
              size="sm"
              onClick={handleVerify}
              disabled={verifyAnim}
              className="w-full text-xs bg-zk-amber text-black hover:bg-zk-amber/80"
            >
              {verifyAnim ? 'Verifying...' : 'Verify Proof'}
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={reset} className="w-full text-xs">
            Reset
          </Button>
        </div>

        <div className="p-3 rounded-lg bg-zk-surface border border-zk-border">
          <div className="text-xs text-muted-foreground space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-zk-violet inline-block" />
              Polynomial Curve
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-zk-cyan inline-block" />
              Evaluation Point
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-zk-amber inline-block" />
              Commitment
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
