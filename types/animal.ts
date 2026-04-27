export type Species = 'perro' | 'gato' | 'otro'
export type Status = 'home' | 'lost' | 'found'

export interface Animal {
  id: string
  name: string
  species: Species
  breed: string | null
  color: string | null
  photo_url: string | null
  lot_number: string
  owner_name: string
  whatsapp: string
  status: Status
  description: string | null
  created_at: string
  lost_at: string | null
  found_at: string | null
  photo_urls: string[]
  photo_position: string | null
}

export interface AnimalFormData {
  name: string
  species: Species
  breed: string
  color: string
  photo_url: string
  lot_number: string
  owner_name: string
  whatsapp: string
  status: Status
  description: string
}
