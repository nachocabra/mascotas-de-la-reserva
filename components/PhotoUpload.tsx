'use client'

import { useRef } from 'react'
import Image from 'next/image'

interface Props {
  previews: string[]
  onAdd: (files: File[]) => void
  onRemove: (index: number) => void
}

export default function PhotoUpload({ previews, onAdd, onRemove }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFiles(files: FileList | null) {
    if (!files) return
    const valid = Array.from(files).filter((f) => f.type.startsWith('image/'))
    if (valid.length) onAdd(valid)
  }

  return (
    <div className="space-y-2">
      {previews.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {previews.map((src, i) => (
            <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-[#e0d8f5]/40">
              <Image src={src} alt="" fill className="object-cover" sizes="150px" />
              <button
                type="button"
                onClick={() => onRemove(i)}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center text-sm font-bold hover:bg-black/80 transition-colors"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div
        onClick={() => inputRef.current?.click()}
        className="w-full h-14 rounded-xl border-2 border-dashed cursor-pointer flex items-center justify-center gap-2 transition-colors border-[#e0d8f5] bg-white hover:border-[#7055be]"
      >
        <span className="text-lg">📷</span>
        <span className="text-sm font-medium" style={{ color: 'var(--bark)', opacity: 0.6 }}>
          {previews.length > 0 ? 'Agregar más fotos' : 'Subir fotos'}
        </span>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
    </div>
  )
}
