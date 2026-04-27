'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Animal, Species, Status } from '@/types/animal'
import AnimalCard from '@/components/AnimalCard'
import FilterBar from '@/components/FilterBar'

export default function HomePage() {
  const [animals, setAnimals] = useState<Animal[]>([])
  const [loading, setLoading] = useState(true)
  const [filterSpecies, setFilterSpecies] = useState<Species | 'all'>('all')
  const [filterStatus, setFilterStatus] = useState<Status | 'all'>('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase.from('animals').select('*')
      if (!error && data) {
        const sorted = [...data].sort((a, b) => a.name.localeCompare(b.name, 'es'))
        setAnimals(sorted)
      }
      setLoading(false)
    }
    load()
  }, [])

  const q = search.trim().toLowerCase()
  const filtered = animals.filter((a) => {
    if (filterSpecies !== 'all' && a.species !== filterSpecies) return false
    if (filterStatus !== 'all' && a.status !== filterStatus) return false
    if (q) {
      const haystack = [a.name, a.breed, a.color, a.lot_number].join(' ').toLowerCase()
      if (!haystack.includes(q)) return false
    }
    return true
  })

  const lostCount = animals.filter((a) => a.status === 'lost').length

  return (
    <div>
      {/* Hero */}
      <div className="mb-8">
        <h1 className="font-display text-4xl md:text-5xl font-bold mb-2" style={{ color: 'var(--bark)' }}>
          Las mascotas<br />
          <span style={{ color: 'var(--moss)' }}>de la Reserva</span>
        </h1>
        <p className="text-base" style={{ color: 'var(--bark)', opacity: 0.6 }}>
          {animals.length} mascotas registradas · {lostCount > 0 ? (
            <span className="font-semibold" style={{ color: 'var(--terracotta)' }}>
              {lostCount} {lostCount === 1 ? 'perdida' : 'perdidas'} ⚠️
            </span>
          ) : (
            <span style={{ color: 'var(--moss)' }}>todas en casa ✓</span>
          )}
        </p>
      </div>

      {lostCount > 0 && (
        <div
          className="mb-6 p-4 rounded-2xl border-2 flex items-start gap-3"
          style={{ borderColor: 'var(--terracotta)', backgroundColor: '#fdf0ec' }}
        >
          <span className="text-2xl">🚨</span>
          <div>
            <p className="font-semibold" style={{ color: 'var(--terracotta)' }}>
              Hay {lostCount} {lostCount === 1 ? 'mascota perdida' : 'mascotas perdidas'} en la Reserva
            </p>
            <p className="text-sm mt-0.5" style={{ color: 'var(--bark)', opacity: 0.7 }}>
              Si la ves, contactá al dueño directo por WhatsApp.
            </p>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative mb-3">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--bark)' }}>
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre, raza, color o lote…"
          className="w-full pl-10 pr-4 py-3 rounded-2xl border border-[#e0d8f5] bg-white outline-none focus:border-[#7055be] transition-colors"
          style={{ color: 'var(--bark)', fontSize: '16px' }}
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-70 text-lg" style={{ color: 'var(--bark)' }}>
            ✕
          </button>
        )}
      </div>

      <FilterBar
        filterSpecies={filterSpecies}
        filterStatus={filterStatus}
        onSpeciesChange={setFilterSpecies}
        onStatusChange={setFilterStatus}
      />

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-[#e8d5b7]/40 animate-pulse h-64" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">🐾</p>
          <p className="font-display text-xl font-semibold" style={{ color: 'var(--bark)' }}>
            {q ? 'Sin resultados' : 'No hay mascotas todavía'}
          </p>
          <p className="text-sm mt-2 mb-6" style={{ color: 'var(--bark)', opacity: 0.5 }}>
            {q ? `No se encontró nada para "${search}"` : '¡Sé el primero en registrar la tuya!'}
          </p>
          <a
            href="/agregar"
            className="inline-block px-6 py-3 rounded-full text-white font-medium"
            style={{ backgroundColor: 'var(--moss)' }}
          >
            Agregar mascota
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
          {filtered.map((animal) => (
            <AnimalCard key={animal.id} animal={animal} />
          ))}
        </div>
      )}
    </div>
  )
}
