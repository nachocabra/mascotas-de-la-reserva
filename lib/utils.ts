import { Species, Status } from '@/types/animal'

export const ACCESS_CODE = 'Vecinos2025'
export const ADMIN_CODE = 'admin2024'

export function validateAccessCode(code: string): boolean {
  return code === ACCESS_CODE
}

export function getWhatsAppUrl(number: string): string {
  const cleaned = number.replace(/\D/g, '')
  return `https://wa.me/${cleaned}`
}

export function whatsappDigits(number: string): string {
  return number.replace(/\D/g, '')
}

export function speciesLabel(species: Species): string {
  const map: Record<Species, string> = {
    perro: '🐶 Perro',
    gato: '🐱 Gato',
    otro: '🐾 Otro',
  }
  return map[species]
}

export function statusLabel(status: Status): string {
  const map: Record<Status, string> = {
    home: 'En casa',
    lost: '¡Perdido!',
    found: 'Encontrado',
  }
  return map[status]
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function statusColor(status: Status): string {
  const map: Record<Status, string> = {
    home: 'bg-emerald-100 text-emerald-800',
    lost: 'bg-red-100 text-red-700',
    found: 'bg-amber-100 text-amber-800',
  }
  return map[status]
}
