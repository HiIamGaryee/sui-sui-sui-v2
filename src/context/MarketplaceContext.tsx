import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { MarketplaceItem } from "../types/marketplace";
import { useSuiContract } from "../hooks/useSuiContract";
import {
  SuiListing,
  SuiEscrow,
  convertMistToSui,
} from "../services/suiContractService";

interface MarketplaceContextType {
  items: MarketplaceItem[];
  blockchainListings: SuiListing[];
  blockchainEscrows: SuiEscrow[];
  addItem: (
    item: Omit<MarketplaceItem, "id" | "likes" | "inEscrow" | "createdAt">
  ) => void;
  updateItem: (id: number, item: Partial<MarketplaceItem>) => void;
  deleteItem: (id: number) => void;
  getItemById: (id: number) => MarketplaceItem | undefined;
  currentUserAddress: string;
  isLoading: boolean;
  refreshBlockchainData: () => Promise<void>;
}

const CURRENT_USER_ADDRESS = "CurrentUser";

const MarketplaceContext = createContext<MarketplaceContextType | undefined>(
  undefined
);

const initialItems: MarketplaceItem[] = [
  {
    id: 1,
    title: "Ethereal Waves",
    price: "120",
    image: "https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=800",
    category: "art",
    seller: "WaveArtist",
    description: "A mesmerizing digital artwork featuring ethereal waves",
    likes: 89,
    inEscrow: false,
    createdAt: new Date("2024-01-15"),
    escrowDuration: 7,
    listingType: "standard",
  },
  {
    id: 2,
    title: "Rare Gaming Sword",
    price: "450",
    image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800",
    category: "gaming",
    seller: "GameMaster",
    description: "Legendary sword with unique attributes",
    likes: 234,
    inEscrow: true,
    createdAt: new Date("2024-01-14"),
    escrowDuration: 14,
    listingType: "escrow",
    escrowBuyerAddress:
      "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
  },
  {
    id: 3,
    title: "Vintage Collection #23",
    price: "200",
    image: "https://images.unsplash.com/photo-1609205807107-e8ec6120f9de?w=800",
    category: "collectibles",
    seller: "Collector99",
    description: "Part of the exclusive vintage digital collection",
    likes: 156,
    inEscrow: false,
    createdAt: new Date("2024-01-13"),
    escrowDuration: 7,
    listingType: "standard",
  },
  {
    id: 4,
    title: "Synthwave Album",
    price: "80",
    image: "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=800",
    category: "music",
    seller: "SynthMaster",
    description: "Original synthwave album with 12 tracks",
    likes: 445,
    inEscrow: false,
    createdAt: new Date("2024-01-12"),
    escrowDuration: 3,
    listingType: "standard",
  },
  {
    id: 5,
    title: "Premium Domain: crypto.sui",
    price: "1000",
    image: "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=800",
    category: "domains",
    seller: "DomainKing",
    description: "Premium .sui domain name for crypto projects",
    likes: 67,
    inEscrow: true,
    createdAt: new Date("2024-01-11"),
    escrowDuration: 30,
    listingType: "escrow",
    escrowBuyerAddress:
      "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
  },
  {
    id: 6,
    title: "Digital Sculpture",
    price: "350",
    image: "https://images.unsplash.com/photo-1569163139394-de4798aa62b6?w=800",
    category: "art",
    seller: "Sculptor3D",
    description: "Unique 3D digital sculpture with animation",
    likes: 298,
    inEscrow: false,
    createdAt: new Date("2024-01-10"),
    escrowDuration: 7,
    listingType: "standard",
  },
];

export const MarketplaceProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [items, setItems] = useState<MarketplaceItem[]>(initialItems);
  const {
    listings: blockchainListings,
    escrows: blockchainEscrows,
    isLoading,
    fetchListings,
    fetchEscrows,
  } = useSuiContract();

  const addItem = (
    newItem: Omit<MarketplaceItem, "id" | "likes" | "inEscrow" | "createdAt">
  ) => {
    const item: MarketplaceItem = {
      ...newItem,
      id: Date.now(), // Use timestamp for unique ID
      likes: 0,
      inEscrow: newItem.listingType === "escrow",
      createdAt: new Date(),
      seller: CURRENT_USER_ADDRESS, // Ensure seller is always set to CurrentUser for new items
    };
    setItems((prev) => [item, ...prev]);
  };

  const updateItem = (id: number, updates: Partial<MarketplaceItem>) => {
    setItems((prev) => {
      return prev.map((item) => {
        if (item.id === id) {
          // Start with the existing item
          let updatedItem = { ...item };

          // Apply all updates except for protected fields
          Object.keys(updates).forEach((key) => {
            const updateKey = key as keyof MarketplaceItem;

            // Skip protected fields that shouldn't be updated
            if (
              updateKey === "id" ||
              updateKey === "seller" ||
              updateKey === "createdAt"
            ) {
              return;
            }

            // Apply the update
            (updatedItem as any)[updateKey] = updates[updateKey];
          });

          // Handle listing type change logic
          if (updates.listingType !== undefined) {
            updatedItem.listingType = updates.listingType;
            updatedItem.inEscrow = updates.listingType === "escrow";

            // Clear escrowBuyerAddress when switching to standard
            if (updates.listingType === "standard") {
              updatedItem.escrowBuyerAddress = undefined;
            }
          }

          // Handle escrowBuyerAddress for escrow listings
          if (
            updates.listingType === "escrow" &&
            updates.escrowBuyerAddress !== undefined
          ) {
            updatedItem.escrowBuyerAddress = updates.escrowBuyerAddress;
          }

          console.log("Updating item:", {
            id,
            originalType: item.listingType,
            newType: updatedItem.listingType,
            updates,
            result: updatedItem,
          });

          return updatedItem;
        }
        return item;
      });
    });
  };

  const deleteItem = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const getItemById = (id: number) => {
    return items.find((item) => item.id === id);
  };

  // Refresh blockchain data
  const refreshBlockchainData = async () => {
    try {
      await Promise.all([fetchListings(), fetchEscrows()]);
    } catch (error) {
      console.error("Error refreshing blockchain data:", error);
    }
  };

  // Fetch blockchain data on mount
  useEffect(() => {
    refreshBlockchainData();
  }, []);

  return (
    <MarketplaceContext.Provider
      value={{
        items,
        blockchainListings,
        blockchainEscrows,
        addItem,
        updateItem,
        deleteItem,
        getItemById,
        currentUserAddress: CURRENT_USER_ADDRESS,
        isLoading,
        refreshBlockchainData,
      }}
    >
      {children}
    </MarketplaceContext.Provider>
  );
};

export const useMarketplace = () => {
  const context = useContext(MarketplaceContext);
  if (!context) {
    throw new Error("useMarketplace must be used within a MarketplaceProvider");
  }
  return context;
};
