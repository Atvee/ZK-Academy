'use client'

import { useState, useCallback, useRef, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import {
  Play,
  Trash2,
  BookOpen,
  Braces,
  Plus,
  X as XIcon,
  Check,
  Settings2,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

// ===== Types =====
type GateType = 'add' | 'mul' | 'const' | 'input' | 'output'

interface GateNode {
  id: string
  type: GateType
  x: number
  y: number
  value?: number
  label: string
  computedValue?: number
}

interface Connection {
  id: string
  fromGateId: string
  toGateId: string
  toPort: number // 0 = left input, 1 = right input (for add/mul)
}

interface R1CSConstraint {
  a: string[]
  b: string[]
  c: string[]
}

// ===== Constants =====
const GATE_RADIUS = 28
const PORT_RADIUS = 5
const GATE_COLORS: Record<GateType, { fill: string; stroke: string; text: string; glow: string }> = {
  input: { fill: 'oklch(0.78 0.14 195 / 15%)', stroke: 'oklch(0.78 0.14 195)', text: 'oklch(0.78 0.14 195)', glow: 'oklch(0.78 0.14 195 / 25%)' },
  const: { fill: 'oklch(0.78 0.16 75 / 15%)', stroke: 'oklch(0.78 0.16 75)', text: 'oklch(0.78 0.16 75)', glow: 'oklch(0.78 0.16 75 / 25%)' },
  add: { fill: 'oklch(0.72 0.19 280 / 15%)', stroke: 'oklch(0.72 0.19 280)', text: 'oklch(0.72 0.19 280)', glow: 'oklch(0.72 0.19 280 / 25%)' },
  mul: { fill: 'oklch(0.72 0.19 280 / 15%)', stroke: 'oklch(0.72 0.19 280)', text: 'oklch(0.72 0.19 280)', glow: 'oklch(0.72 0.19 280 / 25%)' },
  output: { fill: 'oklch(0.72 0.18 155 / 15%)', stroke: 'oklch(0.72 0.18 155)', text: 'oklch(0.72 0.18 155)', glow: 'oklch(0.72 0.18 155 / 25%)' },
}

const GATE_LABELS: Record<GateType, string> = {
  input: 'IN',
  const: 'C',
  add: '+',
  mul: '\u00D7',
  output: 'OUT',
}

const GATE_TYPE_NAMES: Record<GateType, string> = {
  input: 'INPUT',
  const: 'CONST',
  add: 'ADD',
  mul: 'MUL',
  output: 'OUTPUT',
}

let idCounter = 0
function genId() {
  return `gate_${++idCounter}_${Date.now()}`
}

// ===== Example Circuits =====
function createExampleCircuit(name: string): { nodes: GateNode[]; connections: Connection[] } {
  if (name === 'x2+5') {
    const inputId = genId()
    const mulId = genId()
    const constId5 = genId()
    const addId = genId()
    const outId = genId()
    return {
      nodes: [
        { id: inputId, type: 'input', x: 100, y: 200, value: 3, label: 'x' },
        { id: mulId, type: 'mul', x: 280, y: 200, label: 'MUL' },
        { id: constId5, type: 'const', x: 200, y: 320, value: 5, label: '5' },
        { id: addId, type: 'add', x: 440, y: 260, label: 'ADD' },
        { id: outId, type: 'output', x: 600, y: 260, label: 'out' },
      ],
      connections: [
        { id: genId(), fromGateId: inputId, toGateId: mulId, toPort: 0 },
        { id: genId(), fromGateId: inputId, toGateId: mulId, toPort: 1 },
        { id: genId(), fromGateId: mulId, toGateId: addId, toPort: 0 },
        { id: genId(), fromGateId: constId5, toGateId: addId, toPort: 1 },
        { id: genId(), fromGateId: addId, toGateId: outId, toPort: 0 },
      ],
    }
  } else if (name === 'x3+x+5') {
    const inputId = genId()
    const mul1Id = genId()
    const mul2Id = genId()
    const add1Id = genId()
    const constId5 = genId()
    const add2Id = genId()
    const outId = genId()
    return {
      nodes: [
        { id: inputId, type: 'input', x: 80, y: 240, value: 2, label: 'x' },
        { id: mul1Id, type: 'mul', x: 240, y: 160, label: 'MUL' },
        { id: mul2Id, type: 'mul', x: 400, y: 160, label: 'MUL' },
        { id: add1Id, type: 'add', x: 400, y: 320, label: 'ADD' },
        { id: constId5, type: 'const', x: 300, y: 420, value: 5, label: '5' },
        { id: add2Id, type: 'add', x: 560, y: 240, label: 'ADD' },
        { id: outId, type: 'output', x: 700, y: 240, label: 'out' },
      ],
      connections: [
        { id: genId(), fromGateId: inputId, toGateId: mul1Id, toPort: 0 },
        { id: genId(), fromGateId: inputId, toGateId: mul1Id, toPort: 1 },
        { id: genId(), fromGateId: inputId, toGateId: mul1Id, toPort: 0 },
        { id: genId(), fromGateId: mul1Id, toGateId: mul2Id, toPort: 0 },
        { id: genId(), fromGateId: inputId, toGateId: mul2Id, toPort: 1 },
        { id: genId(), fromGateId: mul2Id, toGateId: add2Id, toPort: 0 },
        { id: genId(), fromGateId: inputId, toGateId: add1Id, toPort: 0 },
        { id: genId(), fromGateId: constId5, toGateId: add1Id, toPort: 1 },
        { id: genId(), fromGateId: add1Id, toGateId: add2Id, toPort: 1 },
        { id: genId(), fromGateId: add2Id, toGateId: outId, toPort: 0 },
      ],
    }
  } else {
    // Simple Hash: multiply + add chain
    const inputId = genId()
    const constA = genId()
    const mul1Id = genId()
    const constB = genId()
    const add1Id = genId()
    const constC = genId()
    const mul2Id = genId()
    const outId = genId()
    return {
      nodes: [
        { id: inputId, type: 'input', x: 80, y: 200, value: 7, label: 'msg' },
        { id: constA, type: 'const', x: 80, y: 340, value: 3, label: 'a' },
        { id: mul1Id, type: 'mul', x: 240, y: 240, label: 'MUL' },
        { id: constB, type: 'const', x: 280, y: 400, value: 11, label: 'b' },
        { id: add1Id, type: 'add', x: 420, y: 300, label: 'ADD' },
        { id: constC, type: 'const', x: 440, y: 440, value: 17, label: 'c' },
        { id: mul2Id, type: 'mul', x: 580, y: 360, label: 'MUL' },
        { id: outId, type: 'output', x: 720, y: 360, label: 'hash' },
      ],
      connections: [
        { id: genId(), fromGateId: inputId, toGateId: mul1Id, toPort: 0 },
        { id: genId(), fromGateId: constA, toGateId: mul1Id, toPort: 1 },
        { id: genId(), fromGateId: mul1Id, toGateId: add1Id, toPort: 0 },
        { id: genId(), fromGateId: constB, toGateId: add1Id, toPort: 1 },
        { id: genId(), fromGateId: add1Id, toGateId: mul2Id, toPort: 0 },
        { id: genId(), fromGateId: constC, toGateId: mul2Id, toPort: 1 },
        { id: genId(), fromGateId: mul2Id, toGateId: outId, toPort: 0 },
      ],
    }
  }
}

// ===== Port position helpers =====
function getOutputPortPos(gate: GateNode) {
  return { x: gate.x + GATE_RADIUS, y: gate.y }
}

function getInputPortPos(gate: GateNode, port: number) {
  if (gate.type === 'add' || gate.type === 'mul') {
    const offset = port === 0 ? -12 : 12
    return { x: gate.x - GATE_RADIUS, y: gate.y + offset }
  }
  return { x: gate.x - GATE_RADIUS, y: gate.y }
}

// ===== Evaluation Engine =====
function evaluateCircuit(nodes: GateNode[], connections: Connection[]): GateNode[] {
  const nodeMap = new Map(nodes.map((n) => [n.id, { ...n }]))
  const evaluated = new Set<string>()

  // Pre-compute incoming connections map
  const incomingMap = new Map<string, Connection[]>()
  for (const conn of connections) {
    let incoming = incomingMap.get(conn.toGateId)
    if (!incoming) {
      incoming = []
      incomingMap.set(conn.toGateId, incoming)
    }
    incoming.push(conn)
  }

  // Reset computed values
  for (const node of nodeMap.values()) {
    if (node.type === 'input' || node.type === 'const') {
      node.computedValue = node.value ?? 0
      evaluated.add(node.id)
    } else {
      node.computedValue = undefined
    }
  }

  // Iterative evaluation
  let changed = true
  let iterations = 0
  while (changed && iterations < 100) {
    changed = false
    iterations++
    for (const node of nodeMap.values()) {
      if (evaluated.has(node.id)) continue
      if (node.type !== 'add' && node.type !== 'mul' && node.type !== 'output') continue

      const incoming = incomingMap.get(node.id) || []
      const inputValues: Map<number, number> = new Map()

      for (const conn of incoming) {
        const fromNode = nodeMap.get(conn.fromGateId)
        if (fromNode && fromNode.computedValue !== undefined) {
          inputValues.set(conn.toPort, fromNode.computedValue)
        }
      }

      const neededPorts = node.type === 'output' ? [0] : [0, 1]
      const allInputsReady = neededPorts.every((p) => inputValues.has(p))

      if (allInputsReady) {
        if (node.type === 'add') {
          node.computedValue = (inputValues.get(0) ?? 0) + (inputValues.get(1) ?? 0)
        } else if (node.type === 'mul') {
          node.computedValue = (inputValues.get(0) ?? 0) * (inputValues.get(1) ?? 0)
        } else if (node.type === 'output') {
          node.computedValue = inputValues.get(0) ?? 0
        }
        evaluated.add(node.id)
        changed = true
      }
    }
  }

  return Array.from(nodeMap.values())
}

// ===== R1CS Generator =====
function generateR1CS(nodes: GateNode[], connections: Connection[]): R1CSConstraint[] {
  const constraints: R1CSConstraint[] = []

  // Get all variables
  const vars = nodes.map((n) => n.label || n.id)
  const oneHot = (varName: string, allVars: string[]) =>
    allVars.map((v) => (v === varName ? '1' : '0'))

  for (const node of nodes) {
    if (node.type === 'mul') {
      const incoming = connections.filter((c) => c.toGateId === node.id)
      const leftInput = incoming.find((c) => c.toPort === 0)
      const rightInput = incoming.find((c) => c.toPort === 1)

      const leftLabel = leftInput ? nodes.find((n) => n.id === leftInput.fromGateId)?.label || '0' : '0'
      const rightLabel = rightInput ? nodes.find((n) => n.id === rightInput.fromGateId)?.label || '0' : '0'
      const outLabel = node.label

      constraints.push({
        a: oneHot(leftLabel, vars),
        b: oneHot(rightLabel, vars),
        c: oneHot(outLabel, vars),
      })
    } else if (node.type === 'add') {
      const incoming = connections.filter((c) => c.toGateId === node.id)
      const leftInput = incoming.find((c) => c.toPort === 0)
      const rightInput = incoming.find((c) => c.toPort === 1)

      const leftLabel = leftInput ? nodes.find((n) => n.id === leftInput.fromGateId)?.label || '0' : '0'
      const rightLabel = rightInput ? nodes.find((n) => n.id === rightInput.fromGateId)?.label || '0' : '0'
      const outLabel = node.label

      // Addition: (left + right) * 1 = out
      const aVec = vars.map((v) => {
        if (v === leftLabel) return '1'
        if (v === rightLabel) return '1'
        return '0'
      })

      constraints.push({
        a: aVec,
        b: oneHot('1', [...vars, '1']),
        c: oneHot(outLabel, vars),
      })
    }
  }

  return constraints
}

// ===== Main Component =====
export default function CircuitBuilderSection() {
  const [nodes, setNodes] = useState<GateNode[]>([])
  const [connections, setConnections] = useState<Connection[]>([])
  const [selectedGateType, setSelectedGateType] = useState<GateType | null>(null)
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null)
  const [draggingGateId, setDraggingGateId] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [showR1CS, setShowR1CS] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingGate, setEditingGate] = useState<GateNode | null>(null)
  const [editValue, setEditValue] = useState('')
  const [editLabel, setEditLabel] = useState('')
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [evaluated, setEvaluated] = useState(false)
  const svgRef = useRef<SVGSVGElement>(null)

  // Evaluate
  const handleEvaluate = useCallback(() => {
    const result = evaluateCircuit(nodes, connections)
    setNodes(result)
    setEvaluated(true)
  }, [nodes, connections])

  // Clear
  const handleClear = useCallback(() => {
    setNodes([])
    setConnections([])
    setEvaluated(false)
    setShowR1CS(false)
    setConnectingFrom(null)
  }, [])

  // Load example
  const handleLoadExample = useCallback((name: string) => {
    const example = createExampleCircuit(name)
    setNodes(example.nodes)
    setConnections(example.connections)
    setEvaluated(false)
    setShowR1CS(false)
  }, [])

  // Canvas click: place gate
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!selectedGateType || draggingGateId) return

      const svg = svgRef.current
      if (!svg) return

      const rect = svg.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      // Don't place if clicking on palette area
      if (x < 120) return

      const newGate: GateNode = {
        id: genId(),
        type: selectedGateType,
        x,
        y,
        label: selectedGateType === 'input' ? `x${nodes.filter((n) => n.type === 'input').length + 1}` : selectedGateType === 'const' ? `${nodes.filter((n) => n.type === 'const').length}` : selectedGateType === 'output' ? `out${nodes.filter((n) => n.type === 'output').length + 1}` : GATE_TYPE_NAMES[selectedGateType],
        value: selectedGateType === 'input' ? 1 : selectedGateType === 'const' ? 1 : undefined,
      }

      setNodes((prev) => [...prev, newGate])
      setEvaluated(false)
    },
    [selectedGateType, draggingGateId, nodes]
  )

  // Gate mouse down: start drag
  const handleGateMouseDown = useCallback(
    (e: React.MouseEvent, gateId: string) => {
      e.stopPropagation()
      if (selectedGateType) return // Don't drag when placing

      const gate = nodes.find((n) => n.id === gateId)
      if (!gate) return

      const svg = svgRef.current
      if (!svg) return

      const rect = svg.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      setDraggingGateId(gateId)
      setDragOffset({ x: x - gate.x, y: y - gate.y })
    },
    [nodes, selectedGateType]
  )

  // Gate mouse move: drag
  const handleCanvasMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      const svg = svgRef.current
      if (!svg) return

      const rect = svg.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      setMousePos({ x, y })

      if (draggingGateId) {
        setNodes((prev) =>
          prev.map((n) =>
            n.id === draggingGateId ? { ...n, x: x - dragOffset.x, y: y - dragOffset.y } : n
          )
        )
      }
    },
    [draggingGateId, dragOffset]
  )

  // Mouse up: end drag
  const handleCanvasMouseUp = useCallback(() => {
    setDraggingGateId(null)
  }, [])

  // Output port click: start connection
  const handleOutputPortClick = useCallback(
    (e: React.MouseEvent, gateId: string) => {
      e.stopPropagation()
      if (connectingFrom === gateId) {
        setConnectingFrom(null)
      } else {
        setConnectingFrom(gateId)
      }
    },
    [connectingFrom]
  )

  // Input port click: complete connection
  const handleInputPortClick = useCallback(
    (e: React.MouseEvent, gateId: string, port: number) => {
      e.stopPropagation()
      if (!connectingFrom) return
      if (connectingFrom === gateId) return

      // Check if connection already exists
      const exists = connections.some(
        (c) => c.fromGateId === connectingFrom && c.toGateId === gateId && c.toPort === port
      )
      if (exists) {
        setConnectingFrom(null)
        return
      }

      // Check if port is already occupied
      const occupied = connections.some((c) => c.toGateId === gateId && c.toPort === port)
      if (occupied) {
        setConnectingFrom(null)
        return
      }

      const newConn: Connection = {
        id: genId(),
        fromGateId: connectingFrom,
        toGateId: gateId,
        toPort: port,
      }

      setConnections((prev) => [...prev, newConn])
      setConnectingFrom(null)
      setEvaluated(false)
    },
    [connectingFrom, connections]
  )

  // Right-click: delete gate
  const handleGateContextMenu = useCallback(
    (e: React.MouseEvent, gateId: string) => {
      e.preventDefault()
      e.stopPropagation()
      setNodes((prev) => prev.filter((n) => n.id !== gateId))
      setConnections((prev) => prev.filter((c) => c.fromGateId !== gateId && c.toGateId !== gateId))
      setEvaluated(false)
    },
    []
  )

  // Double-click: edit gate value
  const handleGateDoubleClick = useCallback(
    (e: React.MouseEvent, gateId: string) => {
      e.stopPropagation()
      const gate = nodes.find((n) => n.id === gateId)
      if (!gate) return
      if (gate.type !== 'const' && gate.type !== 'input') return

      setEditingGate(gate)
      setEditValue(String(gate.value ?? ''))
      setEditLabel(gate.label)
      setEditDialogOpen(true)
    },
    [nodes]
  )

  const handleSaveEdit = useCallback(() => {
    if (!editingGate) return
    setNodes((prev) =>
      prev.map((n) =>
        n.id === editingGate.id ? { ...n, value: parseFloat(editValue) || 0, label: editLabel || n.label } : n
      )
    )
    setEvaluated(false)
    setEditDialogOpen(false)
    setEditingGate(null)
  }, [editingGate, editValue, editLabel])

  // Generate R1CS
  const r1csConstraints = useMemo(() => {
    if (!showR1CS || nodes.length === 0) return []
    return generateR1CS(nodes, connections)
  }, [showR1CS, nodes, connections])

  const varNames = useMemo(() => nodes.map((n) => n.label || n.id), [nodes])

  // Bezier curve for connections
  const getConnectionPath = useCallback(
    (conn: Connection) => {
      const fromGate = nodes.find((n) => n.id === conn.fromGateId)
      const toGate = nodes.find((n) => n.id === conn.toGateId)
      if (!fromGate || !toGate) return ''

      const from = getOutputPortPos(fromGate)
      const to = getInputPortPos(toGate, conn.toPort)

      const dx = Math.abs(to.x - from.x) * 0.5
      return `M ${from.x} ${from.y} C ${from.x + dx} ${from.y}, ${to.x - dx} ${to.y}, ${to.x} ${to.y}`
    },
    [nodes]
  )

  // Cancel connecting on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setConnectingFrom(null)
        setSelectedGateType(null)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <div className="flex flex-col h-full min-h-[600px] rounded-xl border border-zk-border bg-zk-surface overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-zk-border bg-zk-surface-hover/50">
        <div className="flex items-center gap-2">
          <Settings2 className="size-4 text-zk-violet" />
          <span className="text-sm font-medium text-muted-foreground">Circuit Builder</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleEvaluate}
            disabled={nodes.length === 0}
            className="h-7 text-xs gap-1.5 text-zk-emerald hover:text-zk-emerald"
          >
            <Play className="size-3.5" />
            Evaluate
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleClear}
            className="h-7 text-xs gap-1.5 text-zk-rose hover:text-zk-rose"
          >
            <Trash2 className="size-3.5" />
            Clear
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost" className="h-7 text-xs gap-1.5">
                <BookOpen className="size-3.5" />
                Load Example
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleLoadExample('x2+5')}>
                x&sup2; + 5
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleLoadExample('x3+x+5')}>
                x&sup3; + x + 5
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleLoadExample('simple-hash')}>
                Simple Hash
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowR1CS(!showR1CS)}
            disabled={nodes.length === 0}
            className="h-7 text-xs gap-1.5 text-zk-amber hover:text-zk-amber"
          >
            <Braces className="size-3.5" />
            Generate R1CS
          </Button>
        </div>
      </div>

      {/* Canvas + Palette */}
      <div className="flex flex-1 overflow-hidden">
        {/* Gate Palette */}
        <div className="w-[110px] shrink-0 border-r border-zk-border bg-zk-surface-hover/30 p-3 flex flex-col gap-2">
          <div className="text-[0.6rem] text-muted-foreground/60 uppercase tracking-wider mb-1">Gates</div>
          {(['input', 'const', 'add', 'mul', 'output'] as GateType[]).map((type) => (
            <button
              key={type}
              onClick={() => {
                setSelectedGateType(selectedGateType === type ? null : type)
                setConnectingFrom(null)
              }}
              className={`flex items-center gap-2 px-2 py-2 rounded-md border text-xs font-medium transition-all ${
                selectedGateType === type
                  ? 'border-zk-violet/50 bg-zk-violet/10 text-zk-violet'
                  : 'border-zk-border/30 bg-zk-surface-hover/50 text-muted-foreground hover:border-zk-border hover:text-foreground'
              }`}
            >
              <svg width="20" height="20" viewBox="0 0 20 20">
                {type === 'add' || type === 'mul' ? (
                  <circle
                    cx="10"
                    cy="10"
                    r="8"
                    fill={GATE_COLORS[type].fill}
                    stroke={GATE_COLORS[type].stroke}
                    strokeWidth="1.5"
                  />
                ) : type === 'const' ? (
                  <rect
                    x="2"
                    y="4"
                    width="16"
                    height="12"
                    rx="2"
                    fill={GATE_COLORS[type].fill}
                    stroke={GATE_COLORS[type].stroke}
                    strokeWidth="1.5"
                  />
                ) : (
                  <polygon
                    points="4,14 8,4 16,4 12,14"
                    fill={GATE_COLORS[type].fill}
                    stroke={GATE_COLORS[type].stroke}
                    strokeWidth="1.5"
                  />
                )}
              </svg>
              <span>{GATE_TYPE_NAMES[type]}</span>
            </button>
          ))}

          <div className="mt-auto pt-3 border-t border-zk-border/20">
            <div className="text-[0.55rem] text-muted-foreground/40 leading-relaxed">
              {selectedGateType ? (
                <>
                  Click canvas to place {GATE_TYPE_NAMES[selectedGateType]} gate
                  <br />
                  <span className="text-muted-foreground/30">ESC to cancel</span>
                </>
              ) : connectingFrom ? (
                <>
                  Click an input port to connect
                  <br />
                  <span className="text-muted-foreground/30">ESC to cancel</span>
                </>
              ) : (
                <>
                  Select gate type, then click canvas.
                  Drag to move. Right-click to delete.
                  Double-click INPUT/CONST to edit.
                </>
              )}
            </div>
          </div>
        </div>

        {/* SVG Canvas */}
        <div className="flex-1 relative overflow-hidden">
          <svg
            ref={svgRef}
            className="w-full h-full zk-grid-bg cursor-crosshair"
            onClick={handleCanvasClick}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
          >
            <defs>
              <filter id="gate-glow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="value-glow">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Connections */}
            {connections.map((conn) => {
              const path = getConnectionPath(conn)
              if (!path) return null
              const fromGate = nodes.find((n) => n.id === conn.fromGateId)
              const hasValue = evaluated && fromGate?.computedValue !== undefined

              return (
                <g key={conn.id}>
                  <motion.path
                    d={path}
                    fill="none"
                    stroke={hasValue ? GATE_COLORS[fromGate!.type].stroke : 'oklch(0.35 0.03 270)'}
                    strokeWidth={hasValue ? 2.5 : 1.5}
                    strokeOpacity={hasValue ? 0.9 : 0.5}
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5 }}
                    className={hasValue ? 'zk-connection-line' : ''}
                  />
                  {/* Value label on connection */}
                  {hasValue && fromGate?.computedValue !== undefined && (
                    <motion.text
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 }}
                      x={(getOutputPortPos(fromGate!).x + getInputPortPos(nodes.find((n) => n.id === conn.toGateId)!, conn.toPort).x) / 2}
                      y={(getOutputPortPos(fromGate!).y + getInputPortPos(nodes.find((n) => n.id === conn.toGateId)!, conn.toPort).y) / 2 - 8}
                      textAnchor="middle"
                      className="text-[0.6rem] font-mono fill-zk-cyan"
                      filter="url(#value-glow)"
                    >
                      {fromGate.computedValue}
                    </motion.text>
                  )}
                </g>
              )
            })}

            {/* Connecting line preview */}
            {connectingFrom && (() => {
              const fromGate = nodes.find((n) => n.id === connectingFrom)
              if (!fromGate) return null
              const from = getOutputPortPos(fromGate)
              return (
                <line
                  x1={from.x}
                  y1={from.y}
                  x2={mousePos.x}
                  y2={mousePos.y}
                  stroke="oklch(0.78 0.14 195)"
                  strokeWidth={1.5}
                  strokeDasharray="6 4"
                  opacity={0.6}
                />
              )
            })()}

            {/* Gates */}
            {nodes.map((gate) => {
              const colors = GATE_COLORS[gate.type]
              const isConnecting = connectingFrom === gate.id
              const hasValue = evaluated && gate.computedValue !== undefined

              return (
                <g
                  key={gate.id}
                  onMouseDown={(e) => handleGateMouseDown(e, gate.id)}
                  onContextMenu={(e) => handleGateContextMenu(e, gate.id)}
                  onDoubleClick={(e) => handleGateDoubleClick(e, gate.id)}
                  className="zk-node"
                  filter={hasValue ? 'url(#gate-glow)' : undefined}
                >
                  {/* Gate shape */}
                  {gate.type === 'add' || gate.type === 'mul' ? (
                    <motion.circle
                      cx={gate.x}
                      cy={gate.y}
                      r={GATE_RADIUS}
                      fill={colors.fill}
                      stroke={colors.stroke}
                      strokeWidth={isConnecting ? 2.5 : 1.5}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1, strokeOpacity: isConnecting ? 1 : 0.7 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    />
                  ) : gate.type === 'const' ? (
                    <motion.rect
                      x={gate.x - GATE_RADIUS}
                      y={gate.y - 18}
                      width={GATE_RADIUS * 2}
                      height={36}
                      rx={4}
                      fill={colors.fill}
                      stroke={colors.stroke}
                      strokeWidth={isConnecting ? 2.5 : 1.5}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1, strokeOpacity: isConnecting ? 1 : 0.7 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    />
                  ) : (
                    <motion.polygon
                      points={`${gate.x - GATE_RADIUS},${gate.y + 16} ${gate.x - GATE_RADIUS + 12},${gate.y - 16} ${gate.x + GATE_RADIUS},${gate.y - 16} ${gate.x + GATE_RADIUS - 12},${gate.y + 16}`}
                      fill={colors.fill}
                      stroke={colors.stroke}
                      strokeWidth={isConnecting ? 2.5 : 1.5}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1, strokeOpacity: isConnecting ? 1 : 0.7 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    />
                  )}

                  {/* Gate label/symbol */}
                  <text
                    x={gate.x}
                    y={gate.y + 1}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill={colors.text}
                    fontSize={gate.type === 'add' || gate.type === 'mul' ? '18' : '10'}
                    fontFamily="var(--font-geist-mono), monospace"
                    fontWeight={gate.type === 'add' || gate.type === 'mul' ? 'bold' : 'medium'}
                    className="pointer-events-none select-none"
                  >
                    {gate.type === 'add' || gate.type === 'mul' ? GATE_LABELS[gate.type] : gate.label}
                  </text>

                  {/* Value display for input/const when evaluated */}
                  {hasValue && gate.computedValue !== undefined && (gate.type === 'input' || gate.type === 'const') && (
                    <motion.text
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      x={gate.x}
                      y={gate.y + (gate.type === 'const' ? 34 : 32)}
                      textAnchor="middle"
                      className="text-[0.6rem] font-mono"
                      fill={colors.text}
                    >
                      = {gate.computedValue}
                    </motion.text>
                  )}

                  {/* Output value for output gates */}
                  {hasValue && gate.type === 'output' && gate.computedValue !== undefined && (
                    <motion.text
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      x={gate.x}
                      y={gate.y - 28}
                      textAnchor="middle"
                      className="text-xs font-mono font-bold"
                      fill={colors.text}
                      filter="url(#value-glow)"
                    >
                      {gate.computedValue}
                    </motion.text>
                  )}

                  {/* Output port (right side) */}
                  <circle
                    cx={getOutputPortPos(gate).x}
                    cy={getOutputPortPos(gate).y}
                    r={PORT_RADIUS}
                    fill={isConnecting ? colors.stroke : 'oklch(0.14 0.015 270)'}
                    stroke={colors.stroke}
                    strokeWidth={1.5}
                    className="cursor-pointer hover:scale-150 transition-transform"
                    onClick={(e) => handleOutputPortClick(e, gate.id)}
                  />

                  {/* Input ports (left side) */}
                  {(gate.type === 'add' || gate.type === 'mul'
                    ? [0, 1]
                    : gate.type === 'output'
                    ? [0]
                    : []
                  ).map((port) => {
                    const pos = getInputPortPos(gate, port)
                    const isOccupied = connections.some(
                      (c) => c.toGateId === gate.id && c.toPort === port
                    )
                    return (
                      <circle
                        key={port}
                        cx={pos.x}
                        cy={pos.y}
                        r={PORT_RADIUS}
                        fill={isOccupied ? colors.stroke : 'oklch(0.14 0.015 270)'}
                        stroke={colors.stroke}
                        strokeWidth={1.5}
                        className="cursor-pointer hover:scale-150 transition-transform"
                        onClick={(e) => handleInputPortClick(e, gate.id, port)}
                      />
                    )
                  })}
                </g>
              )
            })}
          </svg>
        </div>
      </div>

      {/* R1CS Panel */}
      <AnimatePresence>
        {showR1CS && r1csConstraints.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-zk-border overflow-hidden"
          >
            <div className="p-4 bg-zk-surface-hover/30">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Braces className="size-4 text-zk-amber" />
                  <span className="text-sm font-medium text-foreground">R1CS Constraint System</span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowR1CS(false)}
                  className="h-6 w-6 p-0"
                >
                  <XIcon className="size-3.5" />
                </Button>
              </div>

              <div className="overflow-x-auto max-h-64">
                <table className="w-full text-xs font-mono">
                  <thead>
                    <tr className="text-muted-foreground/60">
                      <th className="text-left py-1.5 px-2 border-b border-zk-border/30 w-8">#</th>
                      <th className="text-left py-1.5 px-2 border-b border-zk-border/30 text-zk-violet">A</th>
                      <th className="text-left py-1.5 px-2 border-b border-zk-border/30 text-zk-cyan">B</th>
                      <th className="text-left py-1.5 px-2 border-b border-zk-border/30 text-zk-emerald">C</th>
                    </tr>
                  </thead>
                  <tbody>
                    {r1csConstraints.map((constraint, i) => (
                      <tr key={i} className="hover:bg-zk-surface-hover/50">
                        <td className="py-1.5 px-2 text-muted-foreground/40 border-b border-zk-border/10">{i + 1}</td>
                        <td className="py-1.5 px-2 text-zk-violet/70 border-b border-zk-border/10">
                          <div className="flex flex-wrap gap-0.5">
                            {constraint.a.map((v, j) =>
                              v !== '0' ? (
                                <span key={j} className="bg-zk-violet/10 px-1 rounded">
                                  {v === '1' ? varNames[j] : `${v}*${varNames[j]}`}
                                </span>
                              ) : null
                            )}
                            {constraint.a.every((v) => v === '0') && <span className="text-muted-foreground/30">0</span>}
                          </div>
                        </td>
                        <td className="py-1.5 px-2 text-zk-cyan/70 border-b border-zk-border/10">
                          <div className="flex flex-wrap gap-0.5">
                            {constraint.b.map((v, j) =>
                              v !== '0' ? (
                                <span key={j} className="bg-zk-cyan/10 px-1 rounded">
                                  {v === '1' ? (j < varNames.length ? varNames[j] : '1') : `${v}*${j < varNames.length ? varNames[j] : '1'}`}
                                </span>
                              ) : null
                            )}
                            {constraint.b.every((v) => v === '0') && <span className="text-muted-foreground/30">0</span>}
                          </div>
                        </td>
                        <td className="py-1.5 px-2 text-zk-emerald/70 border-b border-zk-border/10">
                          <div className="flex flex-wrap gap-0.5">
                            {constraint.c.map((v, j) =>
                              v !== '0' ? (
                                <span key={j} className="bg-zk-emerald/10 px-1 rounded">
                                  {v === '1' ? varNames[j] : `${v}*${varNames[j]}`}
                                </span>
                              ) : null
                            )}
                            {constraint.c.every((v) => v === '0') && <span className="text-muted-foreground/30">0</span>}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-3 text-[0.65rem] text-muted-foreground/50">
                {r1csConstraints.length} constraint(s) | {varNames.length} variable(s): {varNames.join(', ')}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-sm bg-zk-surface border-zk-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              Edit {editingGate?.type === 'input' ? 'Input' : 'Constant'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Label</label>
              <Input
                value={editLabel}
                onChange={(e) => setEditLabel(e.target.value)}
                className="bg-zk-surface-hover border-zk-border font-mono"
                placeholder="e.g., x, a, secret"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Value</label>
              <Input
                type="number"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="bg-zk-surface-hover border-zk-border font-mono"
                placeholder="e.g., 5"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditDialogOpen(false)} size="sm">
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} size="sm" className="gap-1">
              <Check className="size-3.5" />
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
