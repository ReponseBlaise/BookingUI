import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../../lib/api'

export function useThreads() {
  return useQuery({ queryKey: ['threads'], queryFn: async () => await api.get<any[]>('/messages/threads') })
}

export function useThreadMessages(threadId?: string) {
  return useQuery({ queryKey: ['thread', threadId], queryFn: async () => threadId ? await api.get<any[]>(`/messages/threads/${threadId}`) : [] })
}

export function useSendMessage() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: (payload: any) => api.post('/messages/send', payload), onSuccess: () => qc.invalidateQueries({ queryKey: ['threads'] }) })
}
