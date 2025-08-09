import { useCallback, useState, useMemo } from 'react';
import { useSuiClient, useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { SuiContractService, SuiListing, SuiEscrow, convertSuiToMist, convertMistToSui } from '../services/suiContractService';
import toast from 'react-hot-toast';

export const useSuiContract = () => {
  const suiClient = useSuiClient();
  const account = useCurrentAccount();
  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const [isLoading, setIsLoading] = useState(false);
  const [listings, setListings] = useState<SuiListing[]>([]);
  const [escrows, setEscrows] = useState<SuiEscrow[]>([]);

  // Memoize the contract service to prevent recreation on every render
  const contractService = useMemo(() => {
    return new SuiContractService(suiClient);
  }, [suiClient]);

  // Fetch all listings from the blockchain
  const fetchListings = useCallback(async () => {
    if (!suiClient) return;
    
    setIsLoading(true);
    try {
      const fetchedListings = await contractService.getListings();
      setListings(fetchedListings);
      return fetchedListings;
    } catch (error) {
      console.error('Error fetching listings:', error);
      toast.error('Failed to fetch listings');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [suiClient, contractService]);

  // Fetch escrows for the current user
  const fetchEscrows = useCallback(async () => {
    if (!suiClient || !account?.address) return;
    
    setIsLoading(true);
    try {
      const fetchedEscrows = await contractService.getEscrows(account.address);
      setEscrows(fetchedEscrows);
      return fetchedEscrows;
    } catch (error) {
      console.error('Error fetching escrows:', error);
      toast.error('Failed to fetch escrows');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [suiClient, contractService, account?.address]);

  // List an item on the marketplace
  const listItem = useCallback(async (
    item: string,
    price: number,
    protectSecs: number
  ) => {
    if (!signAndExecuteTransaction || !account?.address) {
      toast.error('Please connect your wallet first');
      return null;
    }

    setIsLoading(true);
    try {
      const priceInMist = convertSuiToMist(price);
      const protectSecsBigInt = BigInt(protectSecs * 24 * 60 * 60); // Convert days to seconds

      // Build the transaction
      const transaction = contractService.buildListTransaction(
        item,
        priceInMist,
        protectSecsBigInt
      );

      // Execute the transaction
      const result = await signAndExecuteTransaction({
        transaction: transaction,
      });

      toast.success('Item listed successfully!');
      
      // Refresh listings
      await fetchListings();
      
      return result;
    } catch (error) {
      console.error('Error listing item:', error);
      toast.error('Failed to list item');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [signAndExecuteTransaction, account?.address, contractService, fetchListings]);

  // Buy an item from the marketplace
  const buyItem = useCallback(async (
    listingId: string
  ) => {
    if (!signAndExecuteTransaction || !account?.address) {
      toast.error('Please connect your wallet first');
      return null;
    }

    setIsLoading(true);
    try {
      // For now, we'll use a placeholder coin ID
      // In a real implementation, you would need to get the actual coin object ID from the user's wallet
      const coinId = `0x${Math.random().toString(16).substring(2, 66).padEnd(64, '0')}`;
      
      // Build the transaction
      const transaction = contractService.buildBuyTransaction(coinId, listingId);

      // Execute the transaction
      const result = await signAndExecuteTransaction({
        transaction: transaction,
      });

      toast.success('Item purchased successfully!');
      
      // Refresh listings and escrows
      await Promise.all([fetchListings(), fetchEscrows()]);
      
      return result;
    } catch (error) {
      console.error('Error buying item:', error);
      toast.error('Failed to buy item');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [signAndExecuteTransaction, account?.address, contractService, fetchListings, fetchEscrows]);

  // Open a dispute on an escrow
  const openDispute = useCallback(async (escrowId: string) => {
    if (!signAndExecuteTransaction || !account?.address) {
      toast.error('Please connect your wallet first');
      return null;
    }

    setIsLoading(true);
    try {
      // Build the transaction
      const transaction = contractService.buildOpenDisputeTransaction(escrowId);

      // Execute the transaction
      const result = await signAndExecuteTransaction({
        transaction: transaction,
      });

      toast.success('Dispute opened successfully!');
      
      // Refresh escrows
      await fetchEscrows();
      
      return result;
    } catch (error) {
      console.error('Error opening dispute:', error);
      toast.error('Failed to open dispute');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [signAndExecuteTransaction, account?.address, contractService, fetchEscrows]);

  // Buyer cancels an escrow
  const buyerCancel = useCallback(async (escrowId: string) => {
    if (!signAndExecuteTransaction || !account?.address) {
      toast.error('Please connect your wallet first');
      return null;
    }

    setIsLoading(true);
    try {
      // Build the transaction
      const transaction = contractService.buildBuyerCancelTransaction(escrowId);

      // Execute the transaction
      const result = await signAndExecuteTransaction({
        transaction: transaction,
      });

      toast.success('Escrow cancelled successfully!');
      
      // Refresh escrows
      await fetchEscrows();
      
      return result;
    } catch (error) {
      console.error('Error cancelling escrow:', error);
      toast.error('Failed to cancel escrow');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [signAndExecuteTransaction, account?.address, contractService, fetchEscrows]);

  // Seller settles an escrow
  const sellerSettle = useCallback(async (escrowId: string) => {
    if (!signAndExecuteTransaction || !account?.address) {
      toast.error('Please connect your wallet first');
      return null;
    }

    setIsLoading(true);
    try {
      // Build the transaction
      const transaction = contractService.buildSellerSettleTransaction(escrowId);

      // Execute the transaction
      const result = await signAndExecuteTransaction({
        transaction: transaction,
      });

      toast.success('Escrow settled successfully!');
      
      // Refresh escrows
      await fetchEscrows();
      
      return result;
    } catch (error) {
      console.error('Error settling escrow:', error);
      toast.error('Failed to settle escrow');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [signAndExecuteTransaction, account?.address, contractService, fetchEscrows]);

  // Get a specific listing
  const getListing = useCallback(async (listingId: string) => {
    if (!suiClient) return null;
    
    try {
      return await contractService.getListing(listingId);
    } catch (error) {
      console.error('Error fetching listing:', error);
      return null;
    }
  }, [suiClient, contractService]);

  // Get a specific escrow
  const getEscrow = useCallback(async (escrowId: string) => {
    if (!suiClient) return null;
    
    try {
      return await contractService.getEscrow(escrowId);
    } catch (error) {
      console.error('Error fetching escrow:', error);
      return null;
    }
  }, [suiClient, contractService]);

  // Check if user is connected
  const isConnected = !!account?.address;

  // Get user's address
  const userAddress = account?.address || '';

  return {
    // State
    isLoading,
    listings,
    escrows,
    isConnected,
    userAddress,
    
    // Actions
    fetchListings,
    fetchEscrows,
    listItem,
    buyItem,
    openDispute,
    buyerCancel,
    sellerSettle,
    getListing,
    getEscrow,
    
    // Utility functions
    convertSuiToMist,
    convertMistToSui,
  };
}; 