import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Mascotas de la Reserva',
  description: 'Directorio de mascotas de la Reserva',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen" style={{ backgroundColor: 'var(--cream)' }}>
        <header className="border-b sticky top-0 z-40 backdrop-blur-sm" style={{ borderColor: 'var(--sand)', backgroundColor: 'color-mix(in srgb, var(--cream) 85%, transparent)' }}>
          <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
            <a href="/" className="flex items-center gap-2 min-w-0">
              <span className="text-xl shrink-0">🐾</span>
              <span className="font-display text-lg font-semibold truncate" style={{ color: 'var(--bark)' }}>
                Mascotas de la Reserva
              </span>
            </a>
            <a
              href="/agregar"
              className="shrink-0 text-sm font-medium px-4 py-2 rounded-full text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: 'var(--moss)' }}
            >
              + Agregar
            </a>
          </div>
        </header>
        <main className="max-w-5xl mx-auto px-4 py-6 pb-safe">
          {children}
        </main>
      </body>
    </html>
  )
}
