'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Animal, Status } from '@/types/animal'
import { statusLabel, statusColor } from '@/lib/utils'
import AccessCodeModal from '@/components/AccessCodeModal'

export default function EditarPage() {
  const { id } = useParams()
  const router = useRouter()
  const [unlocked, setUnlocked] = useState(false)
  const [animal, setAnimal] = useState<Animal | null>(null)
  const [selected, setSelected] = useState<Status>('home')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('animals').select('*').eq('id', id).single()
      if (data) {
        setAnimal(data)
        setSelected(data.status)
      }
    }
    load()
  }, [id])

  async function handleSave() {
    setLoading(true)
    const updates: Record<string, string | null> = { status: selected }
    if (selected === 'lost') {
      updates.lost_at = new Date().toISOString()
      updates.found_at = null
    } else if (selected === 'found') {
      updates.found_at = new Date().toISOString()
    } else {
      updates.lost_at = null
      updates.found_at = null
    }
    await supabase.from('animals').update(updates).eq('id', id)
    setLoading(false)
    router.push(`/animal/${id}`)
  }

  const statuses: Status[] = ['home', 'lost', 'found']

  const statusIcons: Record<Status, string> = {
    home: '🏠',
    lost: '🚨',
    found: '🎉',
  }

  const statusDescriptions: Record<Status, string> = {
    home: 'Está en casa, todo bien',
    lost: 'Se escapó o no aparece',
    found: 'Alguien lo encontró',
  }

  return (
    <>
      {!unlocked && <AccessCodeModal onSuccess={() => setUnlocked(true)} onClose={() => router.back()} />}

      <div className="max-w-sm mx-auto">
        <a href={`/animal/${id}`} className="text-sm hover:underline" style={{ color: 'var(--moss)' }}>
          ← Volver
        </a>

        <h1 className="font-display text-3xl font-bold mt-4 mb-1" style={{ color: 'var(--bark)' }}>
          Actualizar estado
        </h1>
        {animal && (
          <p className="text-sm mb-8" style={{ color: 'var(--bark)', opacity: 0.55 }}>
            {animal.name} · Lote {animal.lot_number}
          </p>
        )}

        <div className="space-y-3">
          {statuses.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSelected(s)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
                selected === s ? 'border-current' : 'border-[#e8d5b7] bg-white'
              }`}
              style={
                selected === s
                  ? {
                      backgroundColor:
                        s === 'lost' ? '#fdf0ec' : s === 'found' ? '#fffbeb' : '#f0faf4',
                      borderColor:
                        s === 'lost' ? 'var(--terracotta)' : s === 'found' ? '#b45309' : 'var(--moss)',
                    }
                  : {}
              }
            >
              <span className="text-3xl">{statusIcons[s]}</span>
              <div>
                <p className="font-semibold text-sm" style={{ color: 'var(--bark)' }}>
                  {statusLabel(s)}
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--bark)', opacity: 0.55 }}>
                  {statusDescriptions[s]}
                </p>
              </div>
              {selected === s && (
                <span className="ml-auto text-lg">✓</span>
              )}
            </button>
          ))}
        </div>

        <button
          onClick={handleSave}
          disabled={loading}
          className="mt-6 w-full py-4 rounded-2xl text-white font-semibold text-base transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: 'var(--moss)' }}
        >
          {loading ? 'Guardando...' : 'Guardar cambio'}
        </button>
      </div>
    </>
  )
}
