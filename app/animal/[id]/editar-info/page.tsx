'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase, uploadPhoto } from '@/lib/supabase'
import AccessCodeModal from '@/components/AccessCodeModal'
import PhotoUpload from '@/components/PhotoUpload'
import { Animal, Species } from '@/types/animal'
import { whatsappDigits } from '@/lib/utils'
import PhotoPositionPicker from '@/components/PhotoPositionPicker'

export default function EditarInfoPage() {
  const { id } = useParams()
  const router = useRouter()
  const [unlocked, setUnlocked] = useState(false)
  const [animal, setAnimal] = useState<Animal | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [existingUrls, setExistingUrls] = useState<string[]>([])
  const [newFiles, setNewFiles] = useState<File[]>([])
  const [newPreviews, setNewPreviews] = useState<string[]>([])
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

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('animals').select('*').eq('id', id).single()
      if (data) {
        setAnimal(data)
        setForm({
          name: data.name,
          species: data.species,
          breed: data.breed ?? '',
          color: data.color ?? '',
          lot_number: data.lot_number,
          owner_name: data.owner_name,
          whatsapp: data.whatsapp,
          description: data.description ?? '',
          photo_position: data.photo_position ?? 'center',
        })
        const urls = data.photo_urls?.length ? data.photo_urls : (data.photo_url ? [data.photo_url] : [])
        setExistingUrls(urls)
      }
    }
    load()
  }, [id])

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

    const uploadedUrls: string[] = []
    for (const file of newFiles) {
      const url = await uploadPhoto(file)
      if (!url) {
        setError('No se pudo subir una foto. Verificá los permisos del bucket.')
        setLoading(false)
        return
      }
      uploadedUrls.push(url)
    }
    const photo_urls = [...existingUrls, ...uploadedUrls]
    const photo_url = photo_urls[0] ?? null

    const { error: dbError } = await supabase
      .from('animals')
      .update({ ...form, whatsapp: whatsappDigits(form.whatsapp), photo_url, photo_urls })
      .eq('id', id)

    setLoading(false)
    if (dbError) { setError('Error al guardar. Intentá de nuevo.'); return }
    router.push(`/animal/${id}`)
  }

  const inputClass = 'w-full px-4 py-3 rounded-xl border border-[#e0d8f5] bg-white outline-none focus:border-[#7055be] transition-colors text-base'
  const labelClass = 'block text-sm font-medium mb-1.5'

  return (
    <>
      {!unlocked && <AccessCodeModal onSuccess={() => setUnlocked(true)} onClose={() => router.back()} />}

      <div className="max-w-lg mx-auto">
        <div className="mb-8">
          <a href={`/animal/${id}`} className="text-sm hover:underline" style={{ color: 'var(--moss)' }}>
            ← Volver
          </a>
          <h1 className="font-display text-3xl font-bold mt-4" style={{ color: 'var(--bark)' }}>
            Editar información
          </h1>
          {animal && (
            <p className="text-sm mt-1" style={{ color: 'var(--bark)', opacity: 0.55 }}>
              {animal.name} · Lote {animal.lot_number}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className={labelClass} style={{ color: 'var(--bark)' }}>Foto</label>
            <PhotoUpload
              previews={[...existingUrls, ...newPreviews]}
              onAdd={(files) => { setNewFiles((p) => [...p, ...files]); setNewPreviews((p) => [...p, ...files.map((f) => URL.createObjectURL(f))]) }}
              onRemove={(i) => {
                if (i < existingUrls.length) {
                  setExistingUrls((p) => p.filter((_, j) => j !== i))
                } else {
                  const ni = i - existingUrls.length
                  setNewFiles((p) => p.filter((_, j) => j !== ni))
                  setNewPreviews((p) => p.filter((_, j) => j !== ni))
                }
              }}
            />
            {([...existingUrls, ...newPreviews]).length > 0 && (
              <div className="mt-3 w-1/2">
                <PhotoPositionPicker
                  src={[...existingUrls, ...newPreviews][0]}
                  value={form.photo_position}
                  onChange={(pos) => set('photo_position', pos)}
                />
              </div>
            )}
          </div>

          <div>
            <label className={labelClass} style={{ color: 'var(--bark)' }}>Nombre *</label>
            <input className={inputClass} style={{ color: 'var(--bark)' }} value={form.name} onChange={(e) => set('name', e.target.value)} required />
          </div>

          <div>
            <label className={labelClass} style={{ color: 'var(--bark)' }}>Especie *</label>
            <div className="flex gap-2">
              {(['perro', 'gato', 'otro'] as Species[]).map((s) => (
                <button key={s} type="button" onClick={() => set('species', s)}
                  className="flex-1 py-2.5 rounded-xl border-2 text-sm font-medium transition-all"
                  style={form.species === s
                    ? { backgroundColor: 'var(--bark)', borderColor: 'var(--bark)', color: 'white' }
                    : { borderColor: '#e0d8f5', color: 'var(--bark)', backgroundColor: 'white' }}>
                  {s === 'perro' ? '🐶 Perro' : s === 'gato' ? '🐱 Gato' : '🐾 Otro'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass} style={{ color: 'var(--bark)' }}>Raza</label>
              <input className={inputClass} style={{ color: 'var(--bark)' }} value={form.breed} onChange={(e) => set('breed', e.target.value)} />
            </div>
            <div>
              <label className={labelClass} style={{ color: 'var(--bark)' }}>Color</label>
              <input className={inputClass} style={{ color: 'var(--bark)' }} value={form.color} onChange={(e) => set('color', e.target.value)} />
            </div>
          </div>

          <div>
            <label className={labelClass} style={{ color: 'var(--bark)' }}>Número de lote *</label>
            <input className={inputClass} style={{ color: 'var(--bark)' }} value={form.lot_number} onChange={(e) => set('lot_number', e.target.value)} required />
          </div>

          <div>
            <label className={labelClass} style={{ color: 'var(--bark)' }}>Nombre del dueño *</label>
            <input className={inputClass} style={{ color: 'var(--bark)' }} value={form.owner_name} onChange={(e) => set('owner_name', e.target.value)} required />
          </div>

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

          <div>
            <label className={labelClass} style={{ color: 'var(--bark)' }}>Info extra</label>
            <textarea className={`${inputClass} resize-none`} style={{ color: 'var(--bark)' }} rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} />
          </div>

          {error && (
            <p className="text-sm font-medium text-center py-2 rounded-xl bg-red-50" style={{ color: 'var(--terracotta)' }}>{error}</p>
          )}

          <button type="submit" disabled={loading}
            className="w-full py-4 rounded-2xl text-white font-semibold text-base transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: 'var(--moss)' }}>
            {loading ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>
      </div>
    </>
  )
}
