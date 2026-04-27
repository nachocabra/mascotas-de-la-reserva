'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { Animal } from '@/types/animal'
import { speciesLabel, statusLabel, statusColor, getWhatsAppUrl, formatDateTime } from '@/lib/utils'

export default function AnimalDetailPage() {
  const { id } = useParams()
  const [animal, setAnimal] = useState<Animal | null>(null)
  const [loading, setLoading] = useState(true)
  const [photoIndex, setPhotoIndex] = useState(0)

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('animals').select('*').eq('id', id).single()
      if (data && data.status === 'found' && data.found_at) {
        const hoursElapsed = (Date.now() - new Date(data.found_at).getTime()) / 36e5
        if (hoursElapsed >= 24) {
          await supabase.from('animals').update({ status: 'home', found_at: null, lost_at: null }).eq('id', id)
          data.status = 'home'
          data.found_at = null
          data.lost_at = null
        }
      }
      setAnimal(data)
      setLoading(false)
    }
    load()
  }, [id])

  if (loading) {
    return (
      <div className="max-w-lg mx-auto animate-pulse space-y-4">
        <div className="h-72 rounded-3xl bg-[#e8d5b7]/40" />
        <div className="h-8 rounded-xl bg-[#e8d5b7]/40 w-2/3" />
        <div className="h-4 rounded-xl bg-[#e8d5b7]/40 w-1/2" />
      </div>
    )
  }

  if (!animal) {
    return (
      <div className="text-center py-20">
        <p className="text-5xl mb-4">🐾</p>
        <p className="font-display text-xl font-semibold" style={{ color: 'var(--bark)' }}>
          Mascota no encontrada
        </p>
        <a href="/" className="mt-4 inline-block text-sm underline" style={{ color: 'var(--moss)' }}>
          Volver al inicio
        </a>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto">
      <a href="/" className="text-sm hover:underline" style={{ color: 'var(--moss)' }}>
        ← Volver
      </a>

      {/* Photo gallery */}
      {(() => {
        const photos = animal.photo_urls?.length ? animal.photo_urls : (animal.photo_url ? [animal.photo_url] : [])
        const current = photos[photoIndex]
        return (
          <div className="relative mt-4">
            <div className="relative w-full rounded-3xl overflow-hidden bg-[#e0d8f5]/30" style={{ minHeight: '16rem' }}>
              {current ? (
                <Image src={current} alt={animal.name} fill className="object-contain" sizes="(max-width: 768px) 100vw, 512px" style={{ padding: '0.5rem' }} />
              ) : (
                <div className="h-64 flex items-center justify-center text-8xl opacity-20">
                  {animal.species === 'perro' ? '🐶' : animal.species === 'gato' ? '🐱' : '🐾'}
                </div>
              )}
              {photos.length > 1 && (
                <>
                  <button onClick={() => setPhotoIndex((i) => (i - 1 + photos.length) % photos.length)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors">
                    ‹
                  </button>
                  <button onClick={() => setPhotoIndex((i) => (i + 1) % photos.length)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors">
                    ›
                  </button>
                </>
              )}
            </div>
            {photos.length > 1 && (
              <div className="flex justify-center gap-1.5 mt-2">
                {photos.map((_, i) => (
                  <button key={i} onClick={() => setPhotoIndex(i)}
                    className="w-1.5 h-1.5 rounded-full transition-colors"
                    style={{ backgroundColor: i === photoIndex ? 'var(--moss)' : '#e0d8f5' }} />
                ))}
              </div>
            )}
          </div>
        )
      })()}

      {/* Header */}
      <div className="mt-5 flex items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold" style={{ color: 'var(--bark)' }}>
            {animal.name}
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--bark)', opacity: 0.55 }}>
            {speciesLabel(animal.species as any)}
            {animal.breed ? ` · ${animal.breed}` : ''}
          </p>
        </div>
        <span className={`mt-1 text-sm font-semibold px-3 py-1 rounded-full ${statusColor(animal.status as any)}`}>
          {statusLabel(animal.status as any)}
        </span>
      </div>

      {/* Details */}
      <div className="mt-5 rounded-2xl border border-[#e8d5b7] bg-white divide-y divide-[#e8d5b7]">
        {[
          { label: 'Lote', value: animal.lot_number },
          { label: 'Dueño', value: animal.owner_name },
          animal.color ? { label: 'Color', value: animal.color } : null,
          animal.description ? { label: 'Info extra', value: animal.description } : null,
          animal.lost_at && (animal.status === 'lost' || animal.status === 'found')
            ? { label: 'Perdido', value: formatDateTime(animal.lost_at) }
            : null,
        ]
          .filter(Boolean)
          .map((row) => (
            <div key={row!.label} className="flex items-start gap-4 px-5 py-3.5">
              <span className="text-sm w-20 shrink-0 font-medium" style={{ color: 'var(--bark)', opacity: 0.45 }}>
                {row!.label}
              </span>
              <span className="text-sm" style={{ color: 'var(--bark)' }}>
                {row!.value}
              </span>
            </div>
          ))}
      </div>

      {/* WhatsApp */}
      <a
        href={getWhatsAppUrl(animal.whatsapp)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 flex items-center justify-center gap-2 w-full py-4 rounded-2xl text-white font-semibold text-base transition-opacity hover:opacity-90"
        style={{ backgroundColor: '#25D366' }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
        Contactar a {animal.owner_name.split(' ')[0]}
      </a>

      {/* Edit links */}
      <div className="mt-3 flex justify-center gap-5">
        <a href={`/animal/${animal.id}/editar`} className="text-sm underline" style={{ color: 'var(--bark)', opacity: 0.4 }}>
          Actualizar estado
        </a>
        <a href={`/animal/${animal.id}/editar-info`} className="text-sm underline" style={{ color: 'var(--bark)', opacity: 0.4 }}>
          Editar información
        </a>
      </div>
    </div>
  )
}
