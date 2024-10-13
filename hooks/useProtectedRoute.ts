// hooks/useProtectedRoute.ts
import { useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useRouter } from 'expo-router';

const useProtectedRoute = () => {
  const { user, isLoading } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [isLoading, user, router]);
};

export default useProtectedRoute;