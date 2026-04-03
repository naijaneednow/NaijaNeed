import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export const useMyNeeds = () => {
  return useQuery({
    queryKey: ['myNeeds'],
    queryFn: () => api.get('/api/needs/mine').then(r => r.data),
    staleTime: 1000 * 60 * 2,  // refresh every 2 minutes
  });
};

export const useSubmitNeed = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: FormData) => api.post('/api/needs', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }).then(r => r.data),
    onSuccess: () => {
      // Automatically refreshes My Needs page after submission
      queryClient.invalidateQueries({ queryKey: ['myNeeds'] });
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
  });
};

export const useReuploadMedia = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, formData }: { id: number; formData: FormData }) => 
      api.post(`/api/needs/${id}/media`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }).then(r => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myNeeds'] });
    },
  });
};
