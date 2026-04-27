'use client'

import { Species, Status } from '@/types/animal'

interface Props {
  filterSpecies: Species | 'all'
  filterStatus: Status | 'all'
  onSpeciesChange: (v: Species | 'all') => void
  onStatusChange: (v: Status | 'all') => void
}

const pill = (active: boolean) =>
  `px-3 py-1.5 rounded-full text-sm font-medium transition-all cursor-pointer border ${
    active
      ? 'text-white border-transparent'
      : 'bg-white border-[#e8d5b7] hover:border-[#c4a882]'
  }`

export default function FilterBar({ filterSpecies, filterStatus, onSpeciesChange, onStatusChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {/* Species */}
      {(['all', 'perro', 'gato', 'otro'] as const).map((s) => (
        <button
          key={s}
          onClick={() => onSpeciesChange(s)}
          className={pill(filterSpecies === s)}
          style={
            filterSpecies === s
              ? { backgroundColor: 'var(--bark)', color: 'white' }
              : { color: 'var(--bark)' }
          }
        >
          {s === 'all' ? 'Todos' : s === 'perro' ? '🐶 Perros' : s === 'gato' ? '🐱 Gatos' : '🐾 Otros'}
        </button>
      ))}

      <div className="w-px bg-[#e8d5b7] mx-1 self-stretch" />

      {/* Status */}
      {(['all', 'home', 'lost', 'found'] as const).map((s) => (
        <button
          key={s}
          onClick={() => onStatusChange(s)}
          className={pill(filterStatus === s)}
          style={
            filterStatus === s
              ? {
                  backgroundColor:
                    s === 'lost' ? 'var(--terracotta)' : s === 'found' ? '#b45309' : 'var(--moss)',
                  color: 'white',
                }
              : { color: 'var(--bark)' }
          }
        >
          {s === 'all' ? 'Todos los estados' : s === 'home' ? '✓ En casa' : s === 'lost' ? '⚠️ Perdidos' : '🎉 Encontrados'}
        </button>
      ))}
    </div>
  )
}
