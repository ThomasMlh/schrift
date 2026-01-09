import { SWRConfig } from 'swr';
import type { ReactNode } from 'react';

interface APIProviderProps {
  children: ReactNode;
}

export const APIProvider = ({ children }: APIProviderProps) => {
  return (
    <SWRConfig
      value={{
        // Configuration globale de SWR
        revalidateOnFocus: false, // Ne pas revalider au focus de la fenêtre
        revalidateOnReconnect: true, // Revalider lors de la reconnexion
        shouldRetryOnError: true,
        errorRetryCount: 3,
        dedupingInterval: 2000, // Déduplique les requêtes identiques pendant 2s
        focusThrottleInterval: 5000,
        // Cache en mémoire par défaut
      }}
    >
      {children}
    </SWRConfig>
  );
}
