'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

function djb2Hash(str: string): number {
  let hash = 5381
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i)
    hash = hash & hash
  }
  return Math.abs(hash)
}

function toHex(n: number): string {
  return n.toString(16).padStart(8, '0').slice(0, 8)
}

interface TreeNode {
  id: number
  hash: string
  value: string
  left?: number
  right?: number
  isLeaf: boolean
  level: number
}

function buildTree(leaves: string[]): TreeNode[] {
  const nodes: TreeNode[] = []
  let id = 0

  const leafNodes = leaves.map((val) => ({
    id: id++,
    hash: toHex(djb2Hash(val)),
    value: val,
    isLeaf: true,
    level: 0,
  }))
  nodes.push(...leafNodes)

  let currentLevel = leafNodes
  let level = 1

  while (currentLevel.length > 1) {
    const nextLevel: TreeNode[] = []
    for (let i = 0; i < currentLevel.length; i += 2) {
      const left = currentLevel[i]
      const right = currentLevel[i + 1] || currentLevel[i]
      const combinedHash = toHex(djb2Hash(left.hash + right.hash))
      const parent: TreeNode = {
        id: id++,
        hash: combinedHash,
        value: '',
        left: left.id,
        right: right.id,
        isLeaf: false,
        level,
      }
      nodes.push(parent)
      nextLevel.push(parent)
    }
    currentLevel = nextLevel
    level++
  }

  return nodes
}

function getMerkleProof(
  nodes: TreeNode[],
  leafId: number
): { siblingId: number; siblingHash: string; direction: 'left' | 'right' }[] {
  const proof: { siblingId: number; siblingHash: string; direction: 'left' | 'right' }[] = []
  let currentId = leafId

  while (true) {
    const parent = nodes.find((n) => n.left === currentId || n.right === currentId)
    if (!parent) break
    const isLeft = parent.left === currentId
    const siblingId = isLeft ? parent.right! : parent.left!
    const sibling = nodes.find((n) => n.id === siblingId)
    if (sibling) {
      proof.push({
        siblingId,
        siblingHash: sibling.hash,
        direction: isLeft ? 'right' : 'left',
      })
    }
    currentId = parent.id
  }

  return proof
}

function getProofPath(leafId: number, nodes: TreeNode[]): number[] {
  const path: number[] = [leafId]
  let currentId = leafId
  while (true) {
    const parent = nodes.find((n) => n.left === currentId || n.right === currentId)
    if (!parent) break
    path.push(parent.id)
    currentId = parent.id
  }
  return path
}

function getLeafValues(leafCount: number, prev: string[]): string[] {
  if (prev.length === leafCount) return prev
  if (prev.length < leafCount) {
    return [...prev, ...Array.from({ length: leafCount - prev.length }, (_, i) => `tx_${prev.length + i + 1}`)]
  }
  return prev.slice(0, leafCount)
}

export default function MerkleTreeViz() {
  const [leafCount, setLeafCount] = useState(8)
  const [leafValues, setLeafValues] = useState<string[]>(
    () => Array.from({ length: 8 }, (_, i) => `tx_${i + 1}`)
  )
  const [selectedLeaf, setSelectedLeaf] = useState<number | null>(null)
  const [editingLeaf, setEditingLeaf] = useState<number | null>(null)
  const [editValue, setEditValue] = useState('')
  const [showProof, setShowProof] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [verifyStep, setVerifyStep] = useState(-1)
  const [propagationPath, setPropagationPath] = useState<number[]>([])

  const tree = useMemo(() => buildTree(leafValues), [leafValues])
  const root = useMemo(
    () => tree.find((n) => !tree.some((p) => p.left === n.id || p.right === n.id)),
    [tree]
  )
  const proof = useMemo(
    () => (selectedLeaf !== null ? getMerkleProof(tree, selectedLeaf) : []),
    [selectedLeaf, tree]
  )
  const proofPath = useMemo(
    () => (selectedLeaf !== null ? getProofPath(selectedLeaf, tree) : []),
    [selectedLeaf, tree]
  )

  const siblingIds = useMemo(
    () => proof.map((p) => p.siblingId),
    [proof]
  )

  const handleLeafCountChange = useCallback((n: number) => {
    setLeafCount(n)
    setLeafValues((prev) => getLeafValues(n, prev))
    setSelectedLeaf(null)
    setShowProof(false)
    setVerifyStep(-1)
    setPropagationPath([])
  }, [])

  const updateLeaf = useCallback((index: number, value: string) => {
    setLeafValues((prev) => {
      const next = [...prev]
      next[index] = value
      return next
    })
    setEditingLeaf(null)

    const tempTree = buildTree(
      leafValues.map((v, i) => (i === index ? value : v))
    )
    let currentId = index
    const path = [index]
    while (true) {
      const parent = tempTree.find(
        (n) => n.left === currentId || n.right === currentId
      )
      if (!parent) break
      path.push(parent.id)
      currentId = parent.id
    }
    setPropagationPath(path)
    setTimeout(() => setPropagationPath([]), 2000)
  }, [leafValues])

  const handleGenerateProof = useCallback(() => {
    if (selectedLeaf === null) return
    setShowProof(true)
    setVerifyStep(-1)
  }, [selectedLeaf])

  const handleVerify = useCallback(() => {
    if (!showProof) return
    setVerifying(true)
    setVerifyStep(0)

    const steps = proof.length + 1
    let step = 0
    const interval = setInterval(() => {
      step++
      setVerifyStep(step)
      if (step >= steps) {
        clearInterval(interval)
        setVerifying(false)
      }
    }, 800)
  }, [showProof, proof.length])

  const randomizeAll = useCallback(() => {
    setLeafValues(
      Array.from({ length: leafCount }, () => {
        const rand = Math.random().toString(36).slice(2, 8)
        return `tx_${rand}`
      })
    )
    setSelectedLeaf(null)
    setShowProof(false)
    setVerifyStep(-1)
  }, [leafCount])

  const svgW = 800
  const svgH = 440
  const leafNodes = tree.filter((n) => n.isLeaf)
  const levels = Math.ceil(Math.log2(leafCount)) + 1

  const getNodePosition = useCallback(
    (node: TreeNode): { x: number; y: number } => {
      if (node.isLeaf) {
        const idx = leafNodes.findIndex((n) => n.id === node.id)
        const spacing = svgW / (leafCount + 1)
        return { x: spacing * (idx + 1), y: svgH - 50 }
      }
      const leftChild = tree.find((n) => n.id === node.left)
      const rightChild = tree.find((n) => n.id === node.right)
      if (leftChild && rightChild) {
        const lp = getNodePosition(leftChild)
        const rp = getNodePosition(rightChild)
        return { x: (lp.x + rp.x) / 2, y: lp.y - (svgH - 80) / (levels - 1) }
      }
      return { x: svgW / 2, y: 40 }
    },
    [leafNodes, leafCount, tree, levels]
  )

  const isInProofPath = (nodeId: number) => proofPath.includes(nodeId)
  const isSibling = (nodeId: number) => siblingIds.includes(nodeId)
  const isPropagating = (nodeId: number) => propagationPath.includes(nodeId)
  const isVerified = (nodeId: number) => {
    if (verifyStep < 0) return false
    const pathIdx = proofPath.indexOf(nodeId)
    return pathIdx >= 0 && pathIdx <= verifyStep
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 w-full">
      <div className="flex-1 min-w-0">
        <div className="rounded-xl border border-zk-border overflow-hidden bg-zk-surface p-2">
          <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full" style={{ maxHeight: '440px' }}>
            {/* Edges */}
            {tree
              .filter((n) => !n.isLeaf)
              .map((node) => {
                const pos = getNodePosition(node)
                const leftChild = tree.find((n) => n.id === node.left)
                const rightChild = tree.find((n) => n.id === node.right)
                if (!leftChild || !rightChild) return null
                const lp = getNodePosition(leftChild)
                const rp = getNodePosition(rightChild)
                const highlighted =
                  isPropagating(node.id) ||
                  isInProofPath(node.id) ||
                  isVerified(node.id)
                return (
                  <g key={`edge-${node.id}`}>
                    <line
                      x1={lp.x}
                      y1={lp.y}
                      x2={pos.x}
                      y2={pos.y}
                      stroke={highlighted ? '#34d399' : 'rgba(255,255,255,0.15)'}
                      strokeWidth={highlighted ? 2 : 1}
                    />
                    <line
                      x1={rp.x}
                      y1={rp.y}
                      x2={pos.x}
                      y2={pos.y}
                      stroke={highlighted ? '#34d399' : 'rgba(255,255,255,0.15)'}
                      strokeWidth={highlighted ? 2 : 1}
                    />
                  </g>
                )
              })}

            {/* Nodes */}
            {tree.map((node) => {
              const pos = getNodePosition(node)
              const isRoot = node.id === root?.id
              const isLeaf = node.isLeaf
              const isSelected = node.id === selectedLeaf
              const inPath = isInProofPath(node.id)
              const isSib = isSibling(node.id)
              const isProp = isPropagating(node.id)
              const isVer = isVerified(node.id)

              let fill = 'rgba(167,139,250,0.2)'
              let stroke = '#a78bfa'
              let textFill = '#a78bfa'
              let radius = 22

              if (isLeaf) {
                fill = 'rgba(34,211,238,0.15)'
                stroke = '#22d3ee'
                textFill = '#22d3ee'
                radius = 18
              }
              if (isRoot) {
                fill = 'rgba(167,139,250,0.3)'
                stroke = '#a78bfa'
                textFill = '#c4b5fd'
                radius = 28
              }
              if (isSelected) {
                fill = 'rgba(34,211,238,0.3)'
                stroke = '#22d3ee'
              }
              if (inPath) {
                fill = 'rgba(52,211,153,0.2)'
                stroke = '#34d399'
                textFill = '#34d399'
              }
              if (isSib) {
                fill = 'rgba(251,191,36,0.2)'
                stroke = '#fbbf24'
                textFill = '#fbbf24'
              }
              if (isProp) {
                fill = 'rgba(52,211,153,0.3)'
                stroke = '#34d399'
              }
              if (isVer) {
                fill = 'rgba(52,211,153,0.4)'
                stroke = '#34d399'
                textFill = '#34d399'
              }

              return (
                <g
                  key={node.id}
                  onClick={() => {
                    if (isLeaf) {
                      setSelectedLeaf(node.id === selectedLeaf ? null : node.id)
                      setShowProof(false)
                      setVerifyStep(-1)
                    }
                  }}
                  onDoubleClick={() => {
                    if (isLeaf) {
                      const leafIdx = leafNodes.findIndex((n) => n.id === node.id)
                      setEditingLeaf(leafIdx)
                      setEditValue(leafValues[leafIdx] || node.value)
                    }
                  }}
                  className={isLeaf ? 'cursor-pointer' : ''}
                >
                  {/* Glow for root */}
                  {isRoot && (
                    <circle cx={pos.x} cy={pos.y} r={radius + 8} fill="none" stroke="#a78bfa" strokeWidth={1} opacity={0.3}>
                      <animate attributeName="r" values={`${radius + 6};${radius + 14};${radius + 6}`} dur="2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.3;0.1;0.3" dur="2s" repeatCount="indefinite" />
                    </circle>
                  )}
                  {isProp && (
                    <circle cx={pos.x} cy={pos.y} r={radius + 6} fill="none" stroke="#34d399" strokeWidth={2} opacity={0.4}>
                      <animate attributeName="opacity" values="0.4;0.1;0.4" dur="0.5s" repeatCount="3" />
                    </circle>
                  )}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={radius}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={isSelected ? 2.5 : 1.5}
                  />
                  <text
                    x={pos.x}
                    y={pos.y + 1}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={textFill}
                    fontSize={isRoot ? 11 : isLeaf ? 9 : 10}
                    fontFamily="monospace"
                    fontWeight={isRoot ? 'bold' : 'normal'}
                  >
                    {node.hash.slice(0, isRoot ? 8 : 6)}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>

        {/* Inline editing for leaf */}
        <AnimatePresence>
          {editingLeaf !== null && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-3 flex gap-2"
            >
              <Input
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') updateLeaf(editingLeaf, editValue)
                  if (e.key === 'Escape') setEditingLeaf(null)
                }}
                placeholder="New value..."
                className="font-mono text-sm"
                autoFocus
              />
              <Button
                size="sm"
                onClick={() => updateLeaf(editingLeaf, editValue)}
                className="bg-zk-cyan text-black hover:bg-zk-cyan/80"
              >
                Update
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controls & Proof */}
      <div className="w-full lg:w-64 space-y-4">
        <div className="p-4 rounded-xl bg-zk-surface border border-zk-border space-y-3">
          <h3 className="text-sm font-semibold text-zk-violet">Tree Config</h3>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Leaves</label>
            <div className="flex gap-1">
              {[4, 8, 16].map((n) => (
                <Badge
                  key={n}
                  variant={leafCount === n ? 'default' : 'outline'}
                  className="cursor-pointer text-xs"
                  onClick={() => handleLeafCountChange(n)}
                >
                  {n}
                </Badge>
              ))}
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={randomizeAll} className="w-full text-xs">
            Randomize All
          </Button>
        </div>

        <div className="p-4 rounded-xl bg-zk-surface border border-zk-border space-y-3">
          <h3 className="text-sm font-semibold text-zk-violet">Merkle Proof</h3>
          {selectedLeaf !== null ? (
            <>
              <div className="text-xs text-muted-foreground">
                Leaf: <span className="text-zk-cyan font-mono">{tree.find((n) => n.id === selectedLeaf)?.hash.slice(0, 8)}</span>
              </div>
              <Button size="sm" onClick={handleGenerateProof} className="w-full text-xs bg-zk-emerald text-black hover:bg-zk-emerald/80">
                Generate Proof
              </Button>
              {showProof && (
                <Button size="sm" onClick={handleVerify} disabled={verifying} className="w-full text-xs bg-zk-amber text-black hover:bg-zk-amber/80">
                  {verifying ? 'Verifying...' : 'Verify Proof'}
                </Button>
              )}
            </>
          ) : (
            <div className="text-xs text-muted-foreground">Click a leaf to select</div>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedLeaf(null)
              setShowProof(false)
              setVerifyStep(-1)
            }}
            className="w-full text-xs"
          >
            Deselect
          </Button>
        </div>

        {/* Proof list */}
        <AnimatePresence>
          {showProof && proof.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-4 rounded-xl bg-zk-surface border border-zk-border space-y-2 max-h-64 overflow-y-auto"
            >
              <h3 className="text-sm font-semibold text-zk-violet">Proof Siblings</h3>
              {proof.map((p, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`flex items-center gap-2 text-xs font-mono p-1.5 rounded ${
                    verifyStep >= i + 1
                      ? 'bg-zk-emerald/20 text-zk-emerald'
                      : 'bg-zk-amber/10 text-zk-amber'
                  }`}
                >
                  <Badge variant="outline" className="text-[10px] px-1 py-0">
                    {p.direction === 'left' ? 'L' : 'R'}
                  </Badge>
                  <span>{p.siblingHash.slice(0, 8)}</span>
                  {verifyStep >= i + 1 && <span className="ml-auto">✓</span>}
                </motion.div>
              ))}
              {verifyStep >= proof.length + 1 && root && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs font-mono p-1.5 rounded bg-zk-emerald/20 text-zk-emerald"
                >
                  Root: {root.hash.slice(0, 8)} ✓ Verified!
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Color legend */}
        <div className="p-3 rounded-lg bg-zk-surface border border-zk-border">
          <div className="text-xs text-muted-foreground space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-zk-cyan inline-block" />
              Leaves
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-zk-violet inline-block" />
              Internal / Root
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-zk-emerald inline-block" />
              Proof Path
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-zk-amber inline-block" />
              Sibling Nodes
            </div>
          </div>
        </div>

        <div className="p-2 text-xs text-muted-foreground text-center">
          Double-click a leaf to edit its value
        </div>
      </div>
    </div>
  )
}
