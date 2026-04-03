import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
  state_id?: string;
  lga_id?: string;
  area?: string;
  is_admin?: boolean;
}

export const useCurrentUser = () => {
  return useQuery<UserProfile | null>({
    queryKey: ['currentUser'],
    queryFn: () => api.get('/api/auth/me').then(r => r.data),
    staleTime: 1000 * 60 * 5,  // cache for 5 minutes
    retry: false,              // don't retry if not logged in
  });
};
