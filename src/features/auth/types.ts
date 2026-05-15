export type UserRole = 'GUEST' | 'HOST' | 'ADMIN'

export type User = {
  id: string
  name: string
  email: string
  phone?: string
  avatar?: string
  bio?: string
  languagesSpoken?: string[]
  website?: string
  country?: string
  joinedYear?: number
  role: UserRole
  preferredRole?: UserRole
}
