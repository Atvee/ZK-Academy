'use client'

import React, { useRef, useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface Point {
  x: number
  y: number
}

type ViewMode = 'real' | 'finite'
type OperationMode = 'add' | 'double' | 'none'

const PRIMES = [7, 11, 13, 17, 23, 31]

function mod(n: number, p: number): number {
  return ((n % p) + p) % p
}

function modPow(base: number, exp: number, p: number): number {
  let result = 1
  base = mod(base, p)
  while (exp > 0) {
    if (exp % 2 === 1) result = mod(result * base, p)
    exp = Math.floor(exp / 2)
    base = mod(base * base, p)
  }
  return result
}

function modInverse(a: number, p: number): number {
  return modPow(a, p - 2, p)
}

function computeFiniteFieldPoints(a: number, b: number, p: number): Point[] {
  const points: Point[] = []
  for (let x = 0; x < p; x++) {
    const rhs = mod(x * x * x + a * x + b, p)
    for (let y = 0; y < p; y++) {
      if (mod(y * y, p) === rhs) {
        points.push({ x, y })
      }
    }
  }
  return points
}

function addFiniteFieldPoints(
  P: Point | null,
  Q: Point | null,
  a: number,
  p: number
): Point | null {
  if (P === null) return Q
  if (Q === null) return P
  if (P.x === Q.x && P.y === mod(-Q.y, p)) return null
  let lambda: number
  if (P.x === Q.x && P.y === Q.y) {
    if (P.y === 0) return null
    lambda = mod((3 * P.x * P.x + a) * modInverse(2 * P.y, p), p)
  } else {
    lambda = mod((Q.y - P.y) * modInverse(Q.x - P.x, p), p)
  }
  const x3 = mod(lambda * lambda - P.x - Q.x, p)
  const y3 = mod(lambda * (P.x - x3) - P.y, p)
  return { x: x3, y: y3 }
}

export default function EllipticCurveViz() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [aCoeff, setACoeff] = useState(-1)
  const [bCoeff, setBCoeff] = useState(1)
  const [viewMode, setViewMode] = useState<ViewMode>('real')
  const [prime, setPrime] = useState(17)
  const [opMode, setOpMode] = useState<OperationMode>('none')
  const [selectedPoints, setSelectedPoints] = useState<Point[]>([])
  const [resultPoint, setResultPoint] = useState<Point | null>(null)
  const [animStep, setAnimStep] = useState(0)
  const [thirdPoint, setThirdPoint] = useState<Point | null>(null)

  const W = 560
  const H = 560

  const getCurveY = useCallback(
    (x: number): number[] => {
      const val = x * x * x + aCoeff * x + bCoeff
      if (val < 0) return []
      return [Math.sqrt(val), -Math.sqrt(val)]
    },
    [aCoeff, bCoeff]
  )

  const drawRealMode = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      ctx.clearRect(0, 0, W, H)
      const cx = W / 2
      const cy = H / 2
      const scale = 40

      // Grid
      ctx.strokeStyle = 'rgba(255,255,255,0.06)'
      ctx.lineWidth = 1
      for (let i = -7; i <= 7; i++) {
        ctx.beginPath()
        ctx.moveTo(cx + i * scale, 0)
        ctx.lineTo(cx + i * scale, H)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(0, cy + i * scale)
        ctx.lineTo(W, cy + i * scale)
        ctx.stroke()
      }

      // Axes
      ctx.strokeStyle = 'rgba(255,255,255,0.2)'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(0, cy)
      ctx.lineTo(W, cy)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(cx, 0)
      ctx.lineTo(cx, H)
      ctx.stroke()

      // Axis labels
      ctx.fillStyle = 'rgba(255,255,255,0.4)'
      ctx.font = '11px monospace'
      for (let i = -6; i <= 6; i++) {
        if (i === 0) continue
        ctx.fillText(String(i), cx + i * scale - 4, cy + 14)
        ctx.fillText(String(-i), cx + 4, cy + i * scale + 4)
      }

      // Curve
      ctx.strokeStyle = '#a78bfa'
      ctx.lineWidth = 2.5
      ctx.shadowColor = '#a78bfa'
      ctx.shadowBlur = 8

      let started = false
      ctx.beginPath()
      for (let px = 0; px < W; px++) {
        const x = (px - cx) / scale
        const ys = getCurveY(x)
        if (ys.length > 0) {
          const py = cy - ys[0] * scale
          if (!started) {
            ctx.moveTo(px, py)
            started = true
          } else {
            ctx.lineTo(px, py)
          }
        } else {
          started = false
        }
      }
      ctx.stroke()

      // Lower branch
      started = false
      ctx.beginPath()
      for (let px = 0; px < W; px++) {
        const x = (px - cx) / scale
        const ys = getCurveY(x)
        if (ys.length > 0) {
          const py = cy - ys[1] * scale
          if (!started) {
            ctx.moveTo(px, py)
            started = true
          } else {
            ctx.lineTo(px, py)
          }
        } else {
          started = false
        }
      }
      ctx.stroke()
      ctx.shadowBlur = 0

      // Line through selected points
      if (selectedPoints.length >= 2 && animStep >= 1) {
        const [p1, p2] = selectedPoints
        const dx = p2.x - p1.x
        const dy = p2.y - p1.y
        let m: number
        if (opMode === 'double') {
          const denom = 2 * p1.y
          if (Math.abs(denom) < 0.001) return
          m = (3 * p1.x * p1.x + aCoeff) / denom
        } else {
          if (Math.abs(dx) < 0.001) {
            m = 1e6
          } else {
            m = dy / dx
          }
        }
        const b = p1.y - m * p1.x

        ctx.strokeStyle = 'rgba(34,211,238,0.6)'
        ctx.lineWidth = 1.5
        ctx.setLineDash([6, 4])
        ctx.beginPath()
        const yAtLeft = m * (-7) + b
        const yAtRight = m * 7 + b
        ctx.moveTo(cx + -7 * scale, cy - yAtLeft * scale)
        ctx.lineTo(cx + 7 * scale, cy - yAtRight * scale)
        ctx.stroke()
        ctx.setLineDash([])
      }

      // Selected points
      selectedPoints.forEach((pt, i) => {
        const px = cx + pt.x * scale
        const py = cy - pt.y * scale
        ctx.fillStyle = i === 0 ? '#22d3ee' : '#22d3ee'
        ctx.shadowColor = '#22d3ee'
        ctx.shadowBlur = 12
        ctx.beginPath()
        ctx.arc(px, py, 6, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0
        ctx.fillStyle = '#fff'
        ctx.font = 'bold 12px monospace'
        ctx.fillText(`P${i + 1}(${pt.x.toFixed(1)},${pt.y.toFixed(1)})`, px + 10, py - 10)
      })

      // Third intersection point
      if (thirdPoint && animStep >= 2) {
        const px = cx + thirdPoint.x * scale
        const py = cy - thirdPoint.y * scale
        ctx.fillStyle = '#f59e0b'
        ctx.shadowColor = '#f59e0b'
        ctx.shadowBlur = 10
        ctx.beginPath()
        ctx.arc(px, py, 5, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0
        ctx.font = '11px monospace'
        ctx.fillText('R', px + 8, py - 8)
      }

      // Result point (reflected)
      if (resultPoint && animStep >= 3) {
        const px = cx + resultPoint.x * scale
        const py = cy - resultPoint.y * scale
        ctx.fillStyle = '#34d399'
        ctx.shadowColor = '#34d399'
        ctx.shadowBlur = 15
        ctx.beginPath()
        ctx.arc(px, py, 7, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0
        ctx.fillStyle = '#fff'
        ctx.font = 'bold 12px monospace'
        ctx.fillText(
          `P3(${resultPoint.x.toFixed(1)},${resultPoint.y.toFixed(1)})`,
          px + 10,
          py - 10
        )

        // Reflection arrow
        if (thirdPoint) {
          const tpx = cx + thirdPoint.x * scale
          const tpy = cy - thirdPoint.y * scale
          ctx.strokeStyle = 'rgba(52,211,153,0.5)'
          ctx.lineWidth = 1
          ctx.setLineDash([3, 3])
          ctx.beginPath()
          ctx.moveTo(tpx, tpy)
          ctx.lineTo(px, py)
          ctx.stroke()
          ctx.setLineDash([])
        }
      }
    },
    [aCoeff, bCoeff, W, H, getCurveY, selectedPoints, thirdPoint, resultPoint, animStep, opMode]
  )

  const drawFiniteMode = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      ctx.clearRect(0, 0, W, H)
      const points = computeFiniteFieldPoints(aCoeff, bCoeff, prime)
      const margin = 40
      const gridW = W - 2 * margin
      const gridH = H - 2 * margin
      const cellW = gridW / (prime - 1)
      const cellH = gridH / (prime - 1)

      // Grid background
      ctx.strokeStyle = 'rgba(255,255,255,0.08)'
      ctx.lineWidth = 0.5
      for (let i = 0; i < prime; i++) {
        ctx.beginPath()
        ctx.moveTo(margin + i * cellW, margin)
        ctx.lineTo(margin + i * cellW, H - margin)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(margin, margin + i * cellH)
        ctx.lineTo(W - margin, margin + i * cellH)
        ctx.stroke()
      }

      // Labels
      ctx.fillStyle = 'rgba(255,255,255,0.4)'
      ctx.font = '10px monospace'
      for (let i = 0; i < prime; i++) {
        ctx.fillText(String(i), margin + i * cellW - 3, H - margin + 14)
        ctx.fillText(String(i), margin - 18, margin + i * cellH + 4)
      }

      // Points
      points.forEach((pt) => {
        const px = margin + pt.x * cellW
        const py = margin + (prime - 1 - pt.y) * cellH
        let color = '#a78bfa'
        let radius = 4

        if (
          selectedPoints.some((sp) => sp.x === pt.x && sp.y === pt.y)
        ) {
          color = '#22d3ee'
          radius = 6
        }
        if (resultPoint && resultPoint.x === pt.x && resultPoint.y === pt.y) {
          color = '#34d399'
          radius = 7
        }
        if (thirdPoint && thirdPoint.x === pt.x && thirdPoint.y === pt.y) {
          color = '#f59e0b'
          radius = 5
        }

        ctx.fillStyle = color
        ctx.shadowColor = color
        ctx.shadowBlur = radius * 2
        ctx.beginPath()
        ctx.arc(px, py, radius, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0
      })

      // Finite field line
      if (selectedPoints.length >= 2 && animStep >= 1) {
        const [p1, p2] = selectedPoints
        ctx.strokeStyle = 'rgba(34,211,238,0.4)'
        ctx.lineWidth = 1.5
        ctx.setLineDash([4, 4])
        ctx.beginPath()
        const px1 = margin + p1.x * cellW
        const py1 = margin + (prime - 1 - p1.y) * cellH
        const px2 = margin + p2.x * cellW
        const py2 = margin + (prime - 1 - p2.y) * cellH
        ctx.moveTo(px1, py1)
        ctx.lineTo(px2, py2)
        ctx.stroke()
        ctx.setLineDash([])
      }
    },
    [aCoeff, bCoeff, prime, W, H, selectedPoints, resultPoint, thirdPoint, animStep]
  )

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    if (viewMode === 'real') {
      drawRealMode(ctx)
    } else {
      drawFiniteMode(ctx)
    }
  }, [viewMode, drawRealMode, drawFiniteMode])

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      if (viewMode === 'real') {
        const cx = W / 2
        const cy = H / 2
        const scale = 40
        const mathX = (x - cx) / scale
        const mathY = -(y - cy) / scale
        const ys = getCurveY(mathX)
        if (ys.length > 0) {
          const closestY = Math.abs(mathY - ys[0]) < Math.abs(mathY - ys[1]) ? ys[0] : ys[1]
          const pt = { x: parseFloat(mathX.toFixed(2)), y: parseFloat(closestY.toFixed(2)) }
          if (opMode === 'add') {
            if (selectedPoints.length < 2) {
              setSelectedPoints((prev) => [...prev, pt])
            }
          } else if (opMode === 'double') {
            setSelectedPoints([pt, { ...pt }])
          }
        }
      } else {
        const margin = 40
        const gridW = W - 2 * margin
        const gridH = H - 2 * margin
        const cellW = gridW / (prime - 1)
        const cellH = gridH / (prime - 1)
        const gx = Math.round((x - margin) / cellW)
        const gy = prime - 1 - Math.round((y - margin) / cellH)
        if (gx >= 0 && gx < prime && gy >= 0 && gy < prime) {
          const points = computeFiniteFieldPoints(aCoeff, bCoeff, prime)
          const found = points.find((p) => p.x === gx && p.y === gy)
          if (found) {
            if (opMode === 'add') {
              if (selectedPoints.length < 2) {
                setSelectedPoints((prev) => [...prev, { x: gx, y: gy }])
              }
            } else if (opMode === 'double') {
              setSelectedPoints([{ x: gx, y: gy }, { x: gx, y: gy }])
            }
          }
        }
      }
    },
    [viewMode, W, H, getCurveY, opMode, selectedPoints.length, aCoeff, bCoeff, prime]
  )

  const performOperation = useCallback(() => {
    if (selectedPoints.length < 2) return
    const [p1, p2] = selectedPoints

    if (viewMode === 'finite') {
      const res = addFiniteFieldPoints(p1, p2, aCoeff, prime)
      setAnimStep(1)
      setTimeout(() => setAnimStep(2), 600)
      if (res) {
        const third = { x: res.x, y: mod(-res.y, prime) }
        setThirdPoint(third)
        setTimeout(() => {
          setAnimStep(3)
          setResultPoint(res)
        }, 1200)
      } else {
        setThirdPoint(null)
        setResultPoint(null)
        setTimeout(() => setAnimStep(3), 1200)
      }
    } else {
      const dx = p2.x - p1.x
      const dy = p2.y - p1.y
      let m: number
      if (opMode === 'double') {
        const denom = 2 * p1.y
        if (Math.abs(denom) < 0.001) return
        m = (3 * p1.x * p1.x + aCoeff) / denom
      } else {
        if (Math.abs(dx) < 0.001) return
        m = dy / dx
      }
      const bLine = p1.y - m * p1.x
      // Find third intersection: x³ + ax + b = (mx + b)²
      // x³ - m²x² + (a - 2mb)x + (b - b²) = 0
      // We know two roots, find the third
      const sumOfRoots = m * m
      const x3 = sumOfRoots - p1.x - p2.x
      const y3 = m * x3 + bLine
      const third = { x: parseFloat(x3.toFixed(2)), y: parseFloat(y3.toFixed(2)) }
      const result = { x: parseFloat(x3.toFixed(2)), y: parseFloat((-y3).toFixed(2)) }

      setAnimStep(1)
      setTimeout(() => {
        setAnimStep(2)
        setThirdPoint(third)
      }, 600)
      setTimeout(() => {
        setAnimStep(3)
        setResultPoint(result)
      }, 1200)
    }
  }, [selectedPoints, viewMode, aCoeff, prime, opMode])

  const reset = useCallback(() => {
    setSelectedPoints([])
    setResultPoint(null)
    setThirdPoint(null)
    setAnimStep(0)
    setOpMode('none')
  }, [])

  const formulaText =
    opMode === 'double' && selectedPoints.length >= 1
      ? viewMode === 'finite'
        ? `λ = (3x₁² + a) / 2y₁ mod ${prime}`
        : 'λ = (3x₁² + a) / 2y₁'
      : selectedPoints.length >= 2
        ? viewMode === 'finite'
          ? `λ = (y₂ - y₁) / (x₂ - x₁) mod ${prime}`
          : 'λ = (y₂ - y₁) / (x₂ - x₁)'
        : 'Select two points on the curve'

  return (
    <div className="flex flex-col lg:flex-row gap-4 w-full">
      {/* Canvas */}
      <div className="flex-1 min-w-0">
        <div className="rounded-xl border border-zk-border overflow-hidden bg-zk-surface">
          <canvas
            ref={canvasRef}
            width={W}
            height={H}
            onClick={handleCanvasClick}
            className="w-full cursor-crosshair"
            style={{ maxHeight: '560px' }}
          />
        </div>
        {/* Formula display */}
        <motion.div
          className="mt-3 p-3 rounded-lg bg-zk-surface border border-zk-border font-mono text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <span className="text-zk-violet">y² = x³ + ({aCoeff})x + ({bCoeff})</span>
          <span className="mx-3 text-muted-foreground">|</span>
          <span className="text-zk-cyan">{formulaText}</span>
          {animStep >= 3 && resultPoint && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 text-zk-emerald"
            >
              Result: ({resultPoint.x}, {resultPoint.y})
            </motion.div>
          )}
          {animStep >= 3 && !resultPoint && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-2 text-zk-amber"
            >
              Result: Point at infinity (O)
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Controls */}
      <div className="w-full lg:w-64 space-y-4">
        <div className="p-4 rounded-xl bg-zk-surface border border-zk-border space-y-4">
          <h3 className="text-sm font-semibold text-zk-violet">Parameters</h3>
          <div>
            <label className="text-xs text-muted-foreground">a = {aCoeff}</label>
            <Slider
              value={[aCoeff]}
              min={-5}
              max={5}
              step={1}
              onValueChange={([v]) => {
                setACoeff(v)
                reset()
              }}
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">b = {bCoeff}</label>
            <Slider
              value={[bCoeff]}
              min={-5}
              max={5}
              step={1}
              onValueChange={([v]) => {
                setBCoeff(v)
                reset()
              }}
            />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-zk-surface border border-zk-border space-y-3">
          <h3 className="text-sm font-semibold text-zk-violet">View Mode</h3>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={viewMode === 'real' ? 'default' : 'outline'}
              onClick={() => {
                setViewMode('real')
                reset()
              }}
              className="flex-1 text-xs"
            >
              Real ℝ
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'finite' ? 'default' : 'outline'}
              onClick={() => {
                setViewMode('finite')
                reset()
              }}
              className="flex-1 text-xs"
            >
              Finite F_p
            </Button>
          </div>
          {viewMode === 'finite' && (
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Modulus p</label>
              <div className="flex flex-wrap gap-1">
                {PRIMES.map((p) => (
                  <Badge
                    key={p}
                    variant={prime === p ? 'default' : 'outline'}
                    className="cursor-pointer text-xs"
                    onClick={() => {
                      setPrime(p)
                      reset()
                    }}
                  >
                    {p}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 rounded-xl bg-zk-surface border border-zk-border space-y-3">
          <h3 className="text-sm font-semibold text-zk-violet">Operations</h3>
          <Button
            size="sm"
            variant={opMode === 'add' ? 'default' : 'outline'}
            onClick={() => {
              setOpMode('add')
              setSelectedPoints([])
              setResultPoint(null)
              setThirdPoint(null)
              setAnimStep(0)
            }}
            className="w-full text-xs"
          >
            Add Points (P + Q)
          </Button>
          <Button
            size="sm"
            variant={opMode === 'double' ? 'default' : 'outline'}
            onClick={() => {
              setOpMode('double')
              setSelectedPoints([])
              setResultPoint(null)
              setThirdPoint(null)
              setAnimStep(0)
            }}
            className="w-full text-xs"
          >
            Double Point (2P)
          </Button>
          <AnimatePresence>
            {selectedPoints.length >= 2 && animStep === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Button size="sm" onClick={performOperation} className="w-full text-xs bg-zk-emerald text-black hover:bg-zk-emerald/80">
                  Compute
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
          <Button size="sm" variant="outline" onClick={reset} className="w-full text-xs">
            Reset
          </Button>
        </div>

        {/* Info */}
        <div className="p-3 rounded-lg bg-zk-surface border border-zk-border">
          <div className="text-xs text-muted-foreground space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-zk-cyan inline-block" />
              Selected Points
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-zk-amber inline-block" />
              Third Intersection
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-zk-emerald inline-block" />
              Result (Reflected)
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
