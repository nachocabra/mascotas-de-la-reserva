'use client'

import { useState } from 'react'
import { validateAccessCode } from '@/lib/utils'

interface Props {
  onSuccess: () => void
  onClose: () => void
}

export default function AccessCodeModal({ onSuccess, onClose }: Props) {
  const [code, setCode] = useState('')
  const [error, setError] = useState(false)
  const [shake, setShake] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (validateAccessCode(code.trim())) {
      onSuccess()
    } else {
      setError(true)
      setShake(true)
      setTimeout(() => setShake(false), 500)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(44,22,84,0.5)', backdropFilter: 'blur(4px)' }}>
      <div className={`relative bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl border border-[#e0d8f5] ${shake ? 'animate-bounce' : ''}`}>
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-[#e0d8f5]"
          style={{ color: 'var(--bark)', opacity: 0.4 }}
        >
          ✕
        </button>

        <div className="text-center mb-6">
          <p className="text-4xl mb-3">🔑</p>
          <h2 className="font-display text-2xl font-bold" style={{ color: 'var(--bark)' }}>
            Código de la Reserva
          </h2>
          <p className="text-sm mt-2" style={{ color: 'var(--bark)', opacity: 0.6 }}>
            Solo los residentes pueden cargar mascotas
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={code}
            onChange={(e) => { setCode(e.target.value); setError(false) }}
            placeholder="Ingresá el código"
            autoFocus
            className={`w-full px-4 py-3 rounded-xl border-2 text-center text-lg font-medium outline-none transition-colors bg-white ${
              error ? 'border-red-400' : 'border-[#e0d8f5] focus:border-[#7055be]'
            }`}
            style={{ color: 'var(--bark)' }}
          />
          {error && (
            <p className="text-sm text-center font-medium" style={{ color: 'var(--terracotta)' }}>
              Código incorrecto, intentá de nuevo
            </p>
          )}
          <button
            type="submit"
            className="w-full py-3 rounded-xl text-white font-semibold transition-opacity hover:opacity-90"
            style={{ backgroundColor: 'var(--moss)' }}
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  )
}
