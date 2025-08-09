import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';

interface SessionContextType {
  currentUserAddress: string | null;
  isConnected: boolean;
  setUserAddress: (address: string | null) => void;
  canViewEscrowListing: (escrowBuyerAddress?: string) => boolean;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const currentAccount = useCurrentAccount();
  const [currentUserAddress, setCurrentUserAddress] = useState<string | null>(null);

  // Update user address when wallet connection changes
  useEffect(() => {
    if (currentAccount?.address) {
      setCurrentUserAddress(currentAccount.address);
    } else {
      setCurrentUserAddress(null);
    }
  }, [currentAccount]);

  const isConnected = !!currentUserAddress;

  const setUserAddress = (address: string | null) => {
    setCurrentUserAddress(address);
  };

  const canViewEscrowListing = (escrowBuyerAddress?: string): boolean => {
    // If no escrow buyer address is specified, it's not an escrow listing
    if (!escrowBuyerAddress) return true;
    
    // If user is not connected, they can't view escrow listings
    if (!currentUserAddress) return false;
    
    // User can view escrow listing if their address matches the designated buyer
    return currentUserAddress.toLowerCase() === escrowBuyerAddress.toLowerCase();
  };

  return (
    <SessionContext.Provider value={{
      currentUserAddress,
      isConnected,
      setUserAddress,
      canViewEscrowListing,
    }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};
