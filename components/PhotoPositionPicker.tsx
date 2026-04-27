'use client'

import { useEffect, useRef, useState } from 'react'

interface Props {
  src: string
  value: string
  onChange: (position: string) => void
}

function parsePos(value: string): { x: number; y: number } {
  if (!value || value === 'center') return { x: 50, y: 50 }
  const [x, y] = value.split(' ').map(parseFloat)
  return { x: isNaN(x) ? 50 : x, y: isNaN(y) ? 50 : y }
}

export default function PhotoPositionPicker({ src, value, onChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = useState(false)
  const state = useRef({ startX: 0, startY: 0, posX: 50, posY: 50 })

  const pos = parsePos(value)

  function getXY(e: MouseEvent | TouchEvent) {
    if ('touches' in e) return { x: e.touches[0].clientX, y: e.touches[0].clientY }
    return { x: (e as MouseEvent).clientX, y: (e as MouseEvent).clientY }
  }

  function onStart(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault()
    const { x, y } = 'touches' in e.nativeEvent
      ? { x: e.nativeEvent.touches[0].clientX, y: e.nativeEvent.touches[0].clientY }
      : { x: (e as React.MouseEvent).clientX, y: (e as React.MouseEvent).clientY }
    state.current = { startX: x, startY: y, posX: pos.x, posY: pos.y }
    setDragging(true)
  }

  useEffect(() => {
    if (!dragging) return

    function onMove(e: MouseEvent | TouchEvent) {
      const container = containerRef.current
      if (!container) return
      const { width, height } = container.getBoundingClientRect()
      const { x, y } = getXY(e)
      const dx = x - state.current.startX
      const dy = y - state.current.startY
      const newX = Math.max(0, Math.min(100, state.current.posX - (dx / width) * 100))
      const newY = Math.max(0, Math.min(100, state.current.posY - (dy / height) * 100))
      onChange(`${Math.round(newX)}% ${Math.round(newY)}%`)
    }

    function onEnd() { setDragging(false) }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('touchmove', onMove, { passive: false })
    window.addEventListener('mouseup', onEnd)
    window.addEventListener('touchend', onEnd)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('mouseup', onEnd)
      window.removeEventListener('touchend', onEnd)
    }
  }, [dragging, onChange])

  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium" style={{ color: 'var(--bark)', opacity: 0.6 }}>
        Arrastrá para encuadrar
      </p>
      <div
        ref={containerRef}
        onMouseDown={onStart}
        onTouchStart={onStart}
        className={`relative w-full rounded-xl overflow-hidden border border-[#e0d8f5] select-none ${dragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        style={{ height: '13rem' }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt=""
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: value || '50% 50%',
            pointerEvents: 'none',
            userSelect: 'none',
            display: 'block',
          }}
          draggable={false}
        />
        {!dragging && (
          <div className="absolute inset-0 flex items-end justify-center pb-3 pointer-events-none">
            <span className="bg-black/40 text-white text-xs px-2.5 py-1 rounded-full">
              ✥ Mover
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
