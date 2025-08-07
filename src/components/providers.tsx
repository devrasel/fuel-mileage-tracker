'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import FuelHistoryLoading from '@/components/fuel-history-loading';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const { checkAuth, loading } = useAuth();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (loading) {
    return <FuelHistoryLoading />;
  }

  return <>{children}</>;
}
