import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { getFunctionPath, CONTRACT_CONFIG } from '../config/contract';

export interface SuiListing {
  id: string;
  seller: string;
  price: bigint;
  protectSecs: bigint;
  item: unknown;
}

export interface SuiEscrow {
  id: string;
  seller: string;
  buyer: string;
  price: bigint;
  protectSecs: bigint;
  startMs: bigint;
  disputed: boolean;
  item: unknown;
  funds: bigint;
}

interface SuiObjectContent {
  fields: Record<string, unknown>;
}

export class SuiContractService {
  private client: SuiClient;

  constructor(client: SuiClient) {
    this.client = client;
  }

  // Helper method to build transactions for the hook to execute
  buildListTransaction(item: string, price: bigint, protectSecs: bigint): Transaction {
    const tx = new Transaction();
    
    // Set gas budget to prevent automatic budget determination issues
    tx.setGasBudget(CONTRACT_CONFIG.DEFAULT_GAS_BUDGET);
    
    tx.moveCall({
      target: getFunctionPath('list'),
      arguments: [
        tx.object(item),           // T0: The object to list
        tx.pure('u64', price),     // u64: Price in MIST
        tx.pure('u64', protectSecs), // u64: Protection time in seconds
      ],
    });
    
    return tx;
  }

  buildBuyTransaction(coin: string, listingId: string): Transaction {
    const tx = new Transaction();
    
    // Set gas budget to prevent automatic budget determination issues
    tx.setGasBudget(CONTRACT_CONFIG.DEFAULT_GAS_BUDGET);
    
    tx.moveCall({
      target: getFunctionPath('buy'),
      arguments: [
        tx.object(coin),           // Coin<SUI> for payment
        tx.object(listingId),      // Listing object
        tx.object(CONTRACT_CONFIG.CLOCK_OBJECT_ID), // Clock reference
      ],
    });
    
    return tx;
  }

  buildOpenDisputeTransaction(escrowId: string): Transaction {
    const tx = new Transaction();
    
    // Set gas budget to prevent automatic budget determination issues
    tx.setGasBudget(CONTRACT_CONFIG.DEFAULT_GAS_BUDGET);
    
    tx.moveCall({
      target: getFunctionPath('open_dispute'),
      arguments: [
        tx.object(escrowId),      // Escrow object
        tx.object(CONTRACT_CONFIG.CLOCK_OBJECT_ID), // Clock reference
      ],
    });
    
    return tx;
  }

  buildBuyerCancelTransaction(escrowId: string): Transaction {
    const tx = new Transaction();
    
    // Set gas budget to prevent automatic budget determination issues
    tx.setGasBudget(CONTRACT_CONFIG.DEFAULT_GAS_BUDGET);
    
    tx.moveCall({
      target: getFunctionPath('buyer_cancel'),
      arguments: [
        tx.object(escrowId),      // Escrow object
        tx.object(CONTRACT_CONFIG.CLOCK_OBJECT_ID), // Clock reference
      ],
    });
    
    return tx;
  }

  buildSellerSettleTransaction(escrowId: string): Transaction {
    const tx = new Transaction();
    
    // Set gas budget to prevent automatic budget determination issues
    tx.setGasBudget(CONTRACT_CONFIG.DEFAULT_GAS_BUDGET);
    
    tx.moveCall({
      target: getFunctionPath('seller_settle'),
      arguments: [
        tx.object(escrowId),      // Escrow object
        tx.object(CONTRACT_CONFIG.CLOCK_OBJECT_ID), // Clock reference
      ],
    });
    
    return tx;
  }

  // Helper method to create a simple test object for listing
  buildCreateTestObjectTransaction(data: string): Transaction {
    const tx = new Transaction();
    tx.moveCall({
      target: '0x2::object::new',
      arguments: [tx.pure('vector<u8>', Array.from(data, char => char.charCodeAt(0)))],
    });
    return tx;
  }

  async getListings(): Promise<SuiListing[]> {
    try {
      // Note: In the current Sui SDK, we can't directly filter by struct type
      // This is a limitation - we would need to track listing IDs separately
      // For now, return empty array - this would need to be implemented differently
      console.warn('getListings: Direct struct type filtering not available in current SDK');
      return [];
    } catch (error) {
      console.error('Error fetching listings:', error);
      return [];
    }
  }

  async getEscrows(userAddress: string): Promise<SuiEscrow[]> {
    try {
      // Get objects owned by the user
      const ownedObjects = await this.client.getOwnedObjects({
        owner: userAddress,
        options: {
          showContent: true,
          showOwner: true,
        },
      });

      const escrows: SuiEscrow[] = [];
      
      for (const obj of ownedObjects.data) {
        if (obj.data?.content) {
          const content = obj.data.content as SuiObjectContent;
          
          // Check if this is an escrow object by looking for escrow-specific fields
          if (content.fields && 
              'seller' in content.fields && 
              'buyer' in content.fields && 
              'price' in content.fields &&
              'protectSecs' in content.fields) {
            
            escrows.push({
              id: obj.data.objectId,
              seller: content.fields.seller as string,
              buyer: content.fields.buyer as string,
              price: BigInt(content.fields.price as string),
              protectSecs: BigInt(content.fields.protectSecs as string),
              startMs: BigInt(content.fields.startMs as string || '0'),
              disputed: content.fields.disputed as boolean || false,
              item: content.fields.item,
              funds: BigInt(content.fields.funds as string || '0'),
            });
          }
        }
      }
      
      return escrows;
    } catch (error) {
      console.error('Error fetching escrows:', error);
      return [];
    }
  }

  async getListing(listingId: string): Promise<SuiListing | null> {
    try {
      const object = await this.client.getObject({
        id: listingId,
        options: {
          showContent: true,
          showOwner: true,
        },
      });

      if (object.data?.content) {
        const content = object.data.content as SuiObjectContent;
        
        if (content.fields && 
            'seller' in content.fields && 
            'price' in content.fields && 
            'protectSecs' in content.fields) {
          
          return {
            id: object.data.objectId,
            seller: content.fields.seller as string,
            price: BigInt(content.fields.price as string),
            protectSecs: BigInt(content.fields.protectSecs as string),
            item: content.fields.item,
          };
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching listing:', error);
      return null;
    }
  }

  async getEscrow(escrowId: string): Promise<SuiEscrow | null> {
    try {
      const object = await this.client.getObject({
        id: escrowId,
        options: {
          showContent: true,
          showOwner: true,
        },
      });

      if (object.data?.content) {
        const content = object.data.content as SuiObjectContent;
        
        if (content.fields && 
            'seller' in content.fields && 
            'buyer' in content.fields && 
            'price' in content.fields &&
            'protectSecs' in content.fields) {
          
          return {
            id: object.data.objectId,
            seller: content.fields.seller as string,
            buyer: content.fields.buyer as string,
            price: BigInt(content.fields.price as string),
            protectSecs: BigInt(content.fields.protectSecs as string),
            startMs: BigInt(content.fields.startMs as string || '0'),
            disputed: content.fields.disputed as boolean || false,
            item: content.fields.item,
            funds: BigInt(content.fields.funds as string || '0'),
          };
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching escrow:', error);
      return null;
    }
  }
}

// Utility functions for converting between SUI and MIST
export function convertSuiToMist(sui: number): bigint {
  return BigInt(Math.floor(sui * 1000000000)); // 1 SUI = 1,000,000,000 MIST
}

export function convertMistToSui(mist: bigint): number {
  return Number(mist) / 1000000000;
} 