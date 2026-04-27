'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { Animal } from '@/types/animal'
import { ADMIN_CODE, speciesLabel, statusLabel, statusColor } from '@/lib/utils'

export default function AdminPage() {
  const [unlocked, setUnlocked] = useState(false)
  const [code, setCode] = useState('')
  const [codeError, setCodeError] = useState(false)
  const [animals, setAnimals] = useState<Animal[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  useEffect(() => {
    if (!unlocked) return
    async function load() {
      const { data } = await supabase.from('animals').select('*').order('created_at', { ascending: false })
      setAnimals(data ?? [])
      setLoading(false)
    }
    load()
  }, [unlocked])

  function handleCodeSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (code.trim() === ADMIN_CODE) {
      setUnlocked(true)
    } else {
      setCodeError(true)
      setCode('')
    }
  }

  async function handleDelete(animal: Animal) {
    setDeleting(animal.id)
    if (animal.photo_url) {
      const filename = animal.photo_url.split('animal-photos/').pop()
      if (filename) await supabase.storage.from('animal-photos').remove([filename])
    }
    await supabase.from('animals').delete().eq('id', animal.id)
    setAnimals((prev) => prev.filter((a) => a.id !== animal.id))
    setDeleting(null)
    setConfirmId(null)
  }

  if (!unlocked) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'var(--cream)' }}>
        <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-xl border border-[#e0d8f5]">
          <div className="text-center mb-6">
            <p className="text-4xl mb-3">🛡️</p>
            <h2 className="font-display text-2xl font-bold" style={{ color: 'var(--bark)' }}>Panel admin</h2>
            <p className="text-sm mt-2" style={{ color: 'var(--bark)', opacity: 0.6 }}>Ingresá la clave de administrador</p>
          </div>
          <form onSubmit={handleCodeSubmit} className="space-y-4">
            <input
              type="password"
              value={code}
              onChange={(e) => { setCode(e.target.value); setCodeError(false) }}
              placeholder="Clave admin"
              autoFocus
              className={`w-full px-4 py-3 rounded-xl border-2 text-center text-lg font-medium outline-none transition-colors bg-white ${codeError ? 'border-red-400' : 'border-[#e0d8f5] focus:border-[#7055be]'}`}
              style={{ color: 'var(--bark)' }}
            />
            {codeError && <p className="text-sm text-center font-medium" style={{ color: 'var(--terracotta)' }}>Clave incorrecta</p>}
            <button type="submit" className="w-full py-3 rounded-xl text-white font-semibold transition-opacity hover:opacity-90" style={{ backgroundColor: 'var(--moss)' }}>
              Entrar
            </button>
            <a href="/" className="block text-center text-sm underline mt-2" style={{ color: 'var(--bark)', opacity: 0.4 }}>Volver al inicio</a>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <a href="/" className="text-sm hover:underline" style={{ color: 'var(--moss)' }}>← Volver</a>
          <h1 className="font-display text-3xl font-bold mt-2" style={{ color: 'var(--bark)' }}>Panel admin</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--bark)', opacity: 0.55 }}>{animals.length} mascota{animals.length !== 1 ? 's' : ''} registrada{animals.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 rounded-2xl bg-[#e0d8f5]/40 animate-pulse" />)}
        </div>
      ) : animals.length === 0 ? (
        <p className="text-center py-20 opacity-50" style={{ color: 'var(--bark)' }}>No hay mascotas registradas</p>
      ) : (
        <div className="space-y-3">
          {animals.map((animal) => (
            <div key={animal.id} className="flex items-center gap-4 bg-white rounded-2xl border border-[#e0d8f5] p-4">
              <div className="relative h-14 w-14 rounded-xl overflow-hidden bg-[#e0d8f5]/40 shrink-0">
                {animal.photo_url ? (
                  <Image src={animal.photo_url} alt={animal.name} fill className="object-cover" sizes="56px" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-2xl opacity-30">
                    {animal.species === 'perro' ? '🐶' : animal.species === 'gato' ? '🐱' : '🐾'}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm truncate" style={{ color: 'var(--bark)' }}>{animal.name}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(animal.status as any)}`}>
                    {statusLabel(animal.status as any)}
                  </span>
                </div>
                <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--bark)', opacity: 0.5 }}>
                  {speciesLabel(animal.species as any)} · Lote {animal.lot_number} · {animal.owner_name}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a href={`/animal/${animal.id}`}
                  className="text-xs px-3 py-1.5 rounded-lg border font-medium transition-opacity hover:opacity-70"
                  style={{ borderColor: '#e0d8f5', color: 'var(--bark)' }}>
                  Ver
                </a>
                {confirmId === animal.id ? (
                  <div className="flex gap-1">
                    <button onClick={() => handleDelete(animal)} disabled={deleting === animal.id}
                      className="text-xs px-3 py-1.5 rounded-lg text-white font-medium disabled:opacity-50"
                      style={{ backgroundColor: 'var(--terracotta)' }}>
                      {deleting === animal.id ? '...' : 'Confirmar'}
                    </button>
                    <button onClick={() => setConfirmId(null)}
                      className="text-xs px-3 py-1.5 rounded-lg border font-medium"
                      style={{ borderColor: '#e0d8f5', color: 'var(--bark)' }}>
                      No
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setConfirmId(animal.id)}
                    className="text-xs px-3 py-1.5 rounded-lg border font-medium transition-opacity hover:opacity-70"
                    style={{ borderColor: 'var(--terracotta)', color: 'var(--terracotta)' }}>
                    Borrar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
