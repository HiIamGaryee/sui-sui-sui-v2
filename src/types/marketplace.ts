export interface MarketplaceItem {
  id: number;
  title: string;
  price: string;
  image: string;
  category: string;
  seller: string;
  description: string;
  likes: number;
  inEscrow: boolean;
  createdAt: Date;
  escrowDuration: number;
  listingType?: 'standard' | 'escrow';
  escrowBuyerAddress?: string;
}

export interface ListingFormData {
  title: string;
  description: string;
  price: string;
  category: string;
  escrowDuration: string;
  listingType: 'standard' | 'escrow';
  escrowBuyerAddress: string;
}
