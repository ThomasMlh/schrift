import { SWRConfig } from 'swr';
import type { ReactNode } from 'react';

interface APIProviderProps {
  children: ReactNode;
}

export const APIProvider = ({ children }: APIProviderProps) => {
  return (
    <SWRConfig
      value={{
        // Global SWR configuration
        revalidateOnFocus: false,
        revalidateOnReconnect: true,
        shouldRetryOnError: true,
        errorRetryCount: 3,
        dedupingInterval: 2000, // Deduplicate identical requests for 2s
        focusThrottleInterval: 5000,
      }}
    >
      {children}
    </SWRConfig>
  );
}
