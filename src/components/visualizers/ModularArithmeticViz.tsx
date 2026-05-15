'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

const PRIMES = [5, 7, 11, 13, 17, 19, 23]
type Operation = 'add' | 'mul'
type ViewMode = 'clock' | 'table'

export default function ModularArithmeticViz() {
  const [modulus, setModulus] = useState(7)
  const [operation, setOperation] = useState<Operation>('mul')
  const [viewMode, setViewMode] = useState<ViewMode>('clock')
  const [selectedA, setSelectedA] = useState<number | null>(null)
  const [selectedB, setSelectedB] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [showInverses, setShowInverses] = useState(false)
  const [showZeroDivisors, setShowZeroDivisors] = useState(false)
  const [hoveredCell, setHoveredCell] = useState<{ a: number; b: number } | null>(null)

  const compute = useCallback(
    (a: number, b: number): number => {
      if (operation === 'add') return (a + b) % modulus
      return (a * b) % modulus
    },
    [operation, modulus]
  )

  const result = useMemo(() => {
    if (selectedA === null || selectedB === null) return null
    return compute(selectedA, selectedB)
  }, [selectedA, selectedB, compute])

  const handleNumberClick = useCallback(
    (n: number) => {
      if (selectedA === null) {
        setSelectedA(n)
        setSelectedB(null)
        setShowResult(false)
      } else if (selectedB === null) {
        setSelectedB(n)
        setShowResult(true)
      } else {
        setSelectedA(n)
        setSelectedB(null)
        setShowResult(false)
      }
    },
    [selectedA, selectedB]
  )

  const reset = useCallback(() => {
    setSelectedA(null)
    setSelectedB(null)
    setShowResult(false)
  }, [])

  // Clock rendering
  const clockSize = 400
  const cx = clockSize / 2
  const cy = clockSize / 2
  const radius = clockSize / 2 - 50

  const getClockPos = (n: number, r?: number) => {
    const angle = (2 * Math.PI * n) / modulus - Math.PI / 2
    const rad = r ?? radius
    return { x: cx + rad * Math.cos(angle), y: cy + rad * Math.sin(angle) }
  }

  // Color helpers for table
  const getCellColor = (val: number): string => {
    if (showInverses && val === 1) return 'rgba(52,211,153,0.35)'
    if (showZeroDivisors && val === 0) return 'rgba(251,191,36,0.25)'
    const hue = (val / modulus) * 280
    return `hsla(${hue}, 60%, 50%, 0.2)`
  }

  const getCellTextColor = (val: number): string => {
    if (showInverses && val === 1) return '#34d399'
    if (showZeroDivisors && val === 0) return '#fbbf24'
    return 'rgba(255,255,255,0.7)'
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 w-full">
      <div className="flex-1 min-w-0">
        <div className="rounded-xl border border-zk-border overflow-hidden bg-zk-surface p-2">
          <AnimatePresence mode="wait">
            {viewMode === 'clock' ? (
              <motion.div
                key="clock"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <svg
                  viewBox={`0 0 ${clockSize} ${clockSize}`}
                  className="w-full"
                  style={{ maxHeight: '420px' }}
                >
                  {/* Clock circle */}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={radius + 20}
                    fill="none"
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth={1}
                  />
                  <circle
                    cx={cx}
                    cy={cy}
                    r={radius}
                    fill="none"
                    stroke="rgba(255,255,255,0.12)"
                    strokeWidth={1.5}
                  />

                  {/* Arc animation for wrapping */}
                  {showResult && selectedA !== null && selectedB !== null && result !== null && (() => {
                    const startAngle =
                      (2 * Math.PI * selectedA) / modulus - Math.PI / 2
                    const endAngle =
                      (2 * Math.PI * result) / modulus - Math.PI / 2
                    const x1 = cx + (radius - 20) * Math.cos(startAngle)
                    const y1 = cy + (radius - 20) * Math.sin(startAngle)
                    const x2 = cx + (radius - 20) * Math.cos(endAngle)
                    const y2 = cy + (radius - 20) * Math.sin(endAngle)
                    const pathD = `M ${x1} ${y1} A ${radius - 20} ${radius - 20} 0 0 1 ${x2} ${y2}`
                    return (
                    <motion.path
                      d={pathD}
                      fill="none"
                      stroke="#22d3ee"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.8, ease: 'easeInOut' }}
                    />
                  )})()}

                  {/* Number nodes */}
                  {Array.from({ length: modulus }, (_, i) => {
                    const pos = getClockPos(i)
                    const isSelectedA = i === selectedA
                    const isSelectedB = i === selectedB
                    const isResult = showResult && result === i
                    let nodeFill = 'rgba(255,255,255,0.05)'
                    let nodeStroke = 'rgba(255,255,255,0.2)'
                    let textFill = 'rgba(255,255,255,0.6)'
                    let r = 18

                    if (isSelectedA) {
                      nodeFill = 'rgba(167,139,250,0.3)'
                      nodeStroke = '#a78bfa'
                      textFill = '#c4b5fd'
                    }
                    if (isSelectedB) {
                      nodeFill = 'rgba(34,211,238,0.3)'
                      nodeStroke = '#22d3ee'
                      textFill = '#22d3ee'
                    }
                    if (isResult) {
                      nodeFill = 'rgba(52,211,153,0.3)'
                      nodeStroke = '#34d399'
                      textFill = '#34d399'
                      r = 22
                    }

                    // Inverse highlighting
                    if (showInverses && operation === 'mul') {
                      const invExists = Array.from(
                        { length: modulus },
                        (_, j) => j
                      ).some((j) => j > 0 && (i * j) % modulus === 1)
                      if (i > 0 && invExists) {
                        nodeStroke = '#34d399'
                      }
                    }

                    return (
                      <g
                        key={i}
                        onClick={() => handleNumberClick(i)}
                        className="cursor-pointer"
                      >
                        {isResult && (
                          <circle
                            cx={pos.x}
                            cy={pos.y}
                            r={r + 6}
                            fill="none"
                            stroke="#34d399"
                            strokeWidth={1}
                            opacity={0.4}
                          >
                            <animate
                              attributeName="r"
                              values={`${r + 4};${r + 12};${r + 4}`}
                              dur="1.5s"
                              repeatCount="indefinite"
                            />
                            <animate
                              attributeName="opacity"
                              values="0.4;0.1;0.4"
                              dur="1.5s"
                              repeatCount="indefinite"
                            />
                          </circle>
                        )}
                        <circle
                          cx={pos.x}
                          cy={pos.y}
                          r={r}
                          fill={nodeFill}
                          stroke={nodeStroke}
                          strokeWidth={1.5}
                        />
                        <text
                          x={pos.x}
                          y={pos.y + 1}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fill={textFill}
                          fontSize={i >= 10 ? 13 : 15}
                          fontFamily="monospace"
                          fontWeight={isSelectedA || isSelectedB || isResult ? 'bold' : 'normal'}
                        >
                          {i}
                        </text>
                      </g>
                    )
                  })}

                  {/* Center display */}
                  {showResult && selectedA !== null && selectedB !== null && result !== null && (
                    <motion.g
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <circle cx={cx} cy={cy} r={28} fill="rgba(52,211,153,0.1)" stroke="#34d399" strokeWidth={1} />
                      <text
                        x={cx}
                        y={cy + 1}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="#34d399"
                        fontSize={20}
                        fontFamily="monospace"
                        fontWeight="bold"
                      >
                        {result}
                      </text>
                    </motion.g>
                  )}
                </svg>
              </motion.div>
            ) : (
              <motion.div
                key="table"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="overflow-auto max-h-[420px] p-2"
              >
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="p-1 text-xs text-muted-foreground font-mono">
                        {operation === 'add' ? '+' : '×'} mod {modulus}
                      </th>
                      {Array.from({ length: modulus }, (_, i) => (
                        <th
                          key={i}
                          className="p-1 text-xs text-zk-violet font-mono font-semibold"
                        >
                          {i}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: modulus }, (_, i) => (
                      <tr key={i}>
                        <td className="p-1 text-xs text-zk-violet font-mono font-semibold text-right pr-2">
                          {i}
                        </td>
                        {Array.from({ length: modulus }, (_, j) => {
                          const val = compute(i, j)
                          const isHovered =
                            hoveredCell?.a === i && hoveredCell?.b === j
                          return (
                            <td
                              key={j}
                              className="p-0.5"
                              onMouseEnter={() => setHoveredCell({ a: i, b: j })}
                              onMouseLeave={() => setHoveredCell(null)}
                            >
                              <div
                                className={`w-8 h-8 flex items-center justify-center rounded text-xs font-mono transition-all ${
                                  isHovered ? 'ring-1 ring-zk-violet scale-110 z-10' : ''
                                }`}
                                style={{
                                  background: getCellColor(val),
                                  color: getCellTextColor(val),
                                }}
                              >
                                {val}
                              </div>
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Hover equation */}
                <AnimatePresence>
                  {hoveredCell && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="mt-2 text-center font-mono text-sm text-zk-cyan"
                    >
                      {hoveredCell.a} {operation === 'add' ? '+' : '×'}{' '}
                      {hoveredCell.b} ≡ {compute(hoveredCell.a, hoveredCell.b)}{' '}
                      (mod {modulus})
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Result display */}
        <AnimatePresence>
          {showResult && selectedA !== null && selectedB !== null && result !== null && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-3 p-3 rounded-lg bg-zk-surface border border-zk-border font-mono text-sm"
            >
              <span className="text-zk-violet">{selectedA}</span>
              <span className="text-muted-foreground mx-2">
                {operation === 'add' ? '+' : '×'}
              </span>
              <span className="text-zk-cyan">{selectedB}</span>
              <span className="text-muted-foreground mx-2">≡</span>
              <span className="text-zk-emerald font-bold">{result}</span>
              <span className="text-muted-foreground ml-2">(mod {modulus})</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="w-full lg:w-56 space-y-4">
        <div className="p-4 rounded-xl bg-zk-surface border border-zk-border space-y-3">
          <h3 className="text-sm font-semibold text-zk-violet">Modulus</h3>
          <div className="flex flex-wrap gap-1">
            {PRIMES.map((p) => (
              <Badge
                key={p}
                variant={modulus === p ? 'default' : 'outline'}
                className="cursor-pointer text-xs"
                onClick={() => {
                  setModulus(p)
                  reset()
                }}
              >
                {p}
              </Badge>
            ))}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-zk-surface border border-zk-border space-y-3">
          <h3 className="text-sm font-semibold text-zk-violet">Operation</h3>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={operation === 'add' ? 'default' : 'outline'}
              onClick={() => {
                setOperation('add')
                reset()
              }}
              className="flex-1 text-xs"
            >
              + Add
            </Button>
            <Button
              size="sm"
              variant={operation === 'mul' ? 'default' : 'outline'}
              onClick={() => {
                setOperation('mul')
                reset()
              }}
              className="flex-1 text-xs"
            >
              × Mul
            </Button>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-zk-surface border border-zk-border space-y-3">
          <h3 className="text-sm font-semibold text-zk-violet">View</h3>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={viewMode === 'clock' ? 'default' : 'outline'}
              onClick={() => setViewMode('clock')}
              className="flex-1 text-xs"
            >
              Clock
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'table' ? 'default' : 'outline'}
              onClick={() => setViewMode('table')}
              className="flex-1 text-xs"
            >
              Table
            </Button>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-zk-surface border border-zk-border space-y-3">
          <h3 className="text-sm font-semibold text-zk-violet">Highlights</h3>
          <div className="flex items-center gap-2">
            <Switch
              id="inverses"
              checked={showInverses}
              onCheckedChange={setShowInverses}
            />
            <Label htmlFor="inverses" className="text-xs">
              Inverses (result=1)
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="zero-div"
              checked={showZeroDivisors}
              onCheckedChange={setShowZeroDivisors}
            />
            <Label htmlFor="zero-div" className="text-xs">
              Zero divisors (result=0)
            </Label>
          </div>
        </div>

        <Button size="sm" variant="outline" onClick={reset} className="w-full text-xs">
          Reset Selection
        </Button>

        <div className="p-3 rounded-lg bg-zk-surface border border-zk-border">
          <div className="text-xs text-muted-foreground space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-zk-violet inline-block" />
              First operand
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-zk-cyan inline-block" />
              Second operand
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-zk-emerald inline-block" />
              Result
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
