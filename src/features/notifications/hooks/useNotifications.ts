import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../../lib/api'

export function useNotifications() {
  return useQuery({ queryKey: ['notifications'], queryFn: async () => await api.get<any[]>('/notifications') })
}

export function useMarkNotificationRead() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: (id: string) => api.put(`/notifications/${id}/read`), onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }) })
}
