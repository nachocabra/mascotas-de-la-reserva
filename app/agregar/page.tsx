'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, uploadPhoto } from '@/lib/supabase'
import AccessCodeModal from '@/components/AccessCodeModal'
import PhotoUpload from '@/components/PhotoUpload'
import { Species, Status } from '@/types/animal'
import { whatsappDigits } from '@/lib/utils'
import PhotoPositionPicker from '@/components/PhotoPositionPicker'

export default function AgregarPage() {
  const router = useRouter()
  const [unlocked, setUnlocked] = useState(false)
  const [loading, setLoading] = useState(false)
  const [photoFiles, setPhotoFiles] = useState<File[]>([])
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    name: '',
    species: 'perro' as Species,
    breed: '',
    color: '',
    lot_number: '',
    owner_name: '',
    whatsapp: '',
    description: '',
    photo_position: 'center',
  })

  function handleAddPhotos(files: File[]) {
    setPhotoFiles((prev) => [...prev, ...files])
    setPhotoPreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))])
  }

  function handleRemovePhoto(index: number) {
    setPhotoFiles((prev) => prev.filter((_, i) => i !== index))
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!form.name || !form.lot_number || !form.owner_name || !form.whatsapp) {
      setError('Completá los campos obligatorios')
      return
    }

    setLoading(true)

    const photo_urls: string[] = []
    for (const file of photoFiles) {
      const url = await uploadPhoto(file)
      if (!url) {
        setError('No se pudo subir una foto. Verificá los permisos del bucket.')
        setLoading(false)
        return
      }
      photo_urls.push(url)
    }

    const { data, error: dbError } = await supabase
      .from('animals')
      .insert([{ ...form, whatsapp: whatsappDigits(form.whatsapp), photo_url: photo_urls[0] ?? null, photo_urls, status: 'home' }])
      .select()
      .single()

    setLoading(false)

    if (dbError) {
      setError(dbError.message)
      return
    }

    router.push(`/animal/${data.id}`)
  }

  const inputClass =
    'w-full px-4 py-3 rounded-xl border border-[#e0d8f5] bg-white outline-none focus:border-[#7055be] transition-colors text-base'
  const labelClass = 'block text-sm font-medium mb-1.5'

  return (
    <>
      {!unlocked && <AccessCodeModal onSuccess={() => setUnlocked(true)} onClose={() => router.back()} />}

      <div className="max-w-lg mx-auto">
        <div className="mb-8">
          <a href="/" className="text-sm hover:underline" style={{ color: 'var(--moss)' }}>
            ← Volver
          </a>
          <h1 className="font-display text-3xl font-bold mt-4" style={{ color: 'var(--bark)' }}>
            Agregar mascota
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--bark)', opacity: 0.55 }}>
            Campos con * son obligatorios
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Photo */}
          <div>
            <label className={labelClass} style={{ color: 'var(--bark)' }}>Foto</label>
            <PhotoUpload previews={photoPreviews} onAdd={handleAddPhotos} onRemove={handleRemovePhoto} />
            {photoPreviews.length > 0 && (
              <div className="mt-3 w-1/2">
                <PhotoPositionPicker
                  src={photoPreviews[0]}
                  value={form.photo_position}
                  onChange={(pos) => set('photo_position', pos)}
                />
              </div>
            )}
          </div>

          {/* Name */}
          <div>
            <label className={labelClass} style={{ color: 'var(--bark)' }}>Nombre *</label>
            <input
              className={inputClass}
              style={{ color: 'var(--bark)' }}
              placeholder="Ej: Firulais"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              required
            />
          </div>

          {/* Species */}
          <div>
            <label className={labelClass} style={{ color: 'var(--bark)' }}>Especie *</label>
            <div className="flex gap-2">
              {(['perro', 'gato', 'otro'] as Species[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => set('species', s)}
                  className="flex-1 py-2.5 rounded-xl border-2 text-sm font-medium transition-all"
                  style={
                    form.species === s
                      ? { backgroundColor: 'var(--bark)', borderColor: 'var(--bark)', color: 'white' }
                      : { borderColor: '#e8d5b7', color: 'var(--bark)', backgroundColor: 'white' }
                  }
                >
                  {s === 'perro' ? '🐶 Perro' : s === 'gato' ? '🐱 Gato' : '🐾 Otro'}
                </button>
              ))}
            </div>
          </div>

          {/* Breed + Color */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass} style={{ color: 'var(--bark)' }}>Raza</label>
              <input
                className={inputClass}
                style={{ color: 'var(--bark)' }}
                placeholder="Ej: Labrador"
                value={form.breed}
                onChange={(e) => set('breed', e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass} style={{ color: 'var(--bark)' }}>Color</label>
              <input
                className={inputClass}
                style={{ color: 'var(--bark)' }}
                placeholder="Ej: Negro y blanco"
                value={form.color}
                onChange={(e) => set('color', e.target.value)}
              />
            </div>
          </div>

          {/* Lot */}
          <div>
            <label className={labelClass} style={{ color: 'var(--bark)' }}>Número de lote *</label>
            <input
              className={inputClass}
              style={{ color: 'var(--bark)' }}
              placeholder="Ej: 42"
              value={form.lot_number}
              onChange={(e) => set('lot_number', e.target.value)}
              required
            />
          </div>

          {/* Owner */}
          <div>
            <label className={labelClass} style={{ color: 'var(--bark)' }}>Nombre del dueño *</label>
            <input
              className={inputClass}
              style={{ color: 'var(--bark)' }}
              placeholder="Ej: Juan García"
              value={form.owner_name}
              onChange={(e) => set('owner_name', e.target.value)}
              required
            />
          </div>

          {/* WhatsApp */}
          <div>
            <label className={labelClass} style={{ color: 'var(--bark)' }}>WhatsApp *</label>
            <div className="flex">
              <span className="px-4 py-3 rounded-l-xl border border-r-0 border-[#e0d8f5] bg-[#f7f4ff] text-sm font-medium select-none" style={{ color: 'var(--bark)', opacity: 0.6 }}>+</span>
              <input
                className="flex-1 px-4 py-3 rounded-r-xl border border-[#e0d8f5] bg-white outline-none focus:border-[#7055be] transition-colors text-sm"
                style={{ color: 'var(--bark)' }}
                placeholder="54 9 11 5555 4444"
                value={form.whatsapp}
                onChange={(e) => set('whatsapp', e.target.value)}
                required
              />
            </div>
            <p className="text-xs mt-1.5 opacity-50" style={{ color: 'var(--bark)' }}>Con código de país (Argentina: 54, Uruguay: 598, Brasil: 55…)</p>
          </div>

          {/* Description */}
          <div>
            <label className={labelClass} style={{ color: 'var(--bark)' }}>Info extra</label>
            <textarea
              className={`${inputClass} resize-none`}
              style={{ color: 'var(--bark)' }}
              rows={3}
              placeholder="Señas particulares, si tiene collar, si es manso..."
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
            />
          </div>

          {error && (
            <p className="text-sm font-medium text-center py-2 rounded-xl bg-red-50" style={{ color: 'var(--terracotta)' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl text-white font-semibold text-base transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: 'var(--moss)' }}
          >
            {loading ? 'Guardando...' : 'Guardar mascota'}
          </button>
        </form>
      </div>
    </>
  )
}
