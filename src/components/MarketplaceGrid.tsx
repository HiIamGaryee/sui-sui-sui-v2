import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Eye, Filter, Grid, List, Shield, Zap, Lock, Edit2, Trash2, MoreVertical } from 'lucide-react';
import ItemDetailModal from './ItemDetailModal';
import EditListingModal from './EditListingModal';
import { useMarketplace } from '../context/MarketplaceContext';
import { useSession } from '../context/SessionContext';
import { MarketplaceItem } from '../types/marketplace';
import toast from 'react-hot-toast';

interface MarketplaceGridProps {
  searchQuery: string;
  category: string;
}

const MarketplaceGrid: React.FC<MarketplaceGridProps> = ({ searchQuery, category }) => {
  const { items, deleteItem, currentUserAddress } = useMarketplace();
  const { canViewEscrowListing, isConnected } = useSession();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedItem, setSelectedItem] = useState<MarketplaceItem | null>(null);
  const [editingItem, setEditingItem] = useState<MarketplaceItem | null>(null);
  const [sortBy, setSortBy] = useState('recent');
  const [showActionsFor, setShowActionsFor] = useState<number | null>(null);

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.seller.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = category === 'all' || item.category === category;
    
    // Filter out escrow listings that the current user cannot view
    const canView = item.listingType === 'escrow' 
      ? canViewEscrowListing(item.escrowBuyerAddress)
      : true;
    
    return matchesSearch && matchesCategory && canView;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return parseFloat(a.price) - parseFloat(b.price);
      case 'price-high':
        return parseFloat(b.price) - parseFloat(a.price);
      case 'popular':
        return b.likes - a.likes;
      case 'recent':
        return b.createdAt.getTime() - a.createdAt.getTime();
      default:
        return 0;
    }
  });

  // Count hidden escrow listings for display
  const hiddenEscrowCount = items.filter(item => 
    item.listingType === 'escrow' && !canViewEscrowListing(item.escrowBuyerAddress)
  ).length;

  const handleEdit = (item: MarketplaceItem) => {
    console.log('Editing item:', item);
    setEditingItem(item);
    setShowActionsFor(null);
  };

  const handleDelete = (item: MarketplaceItem) => {
    if (window.confirm(`Are you sure you want to delete "${item.title}"?`)) {
      deleteItem(item.id);
      toast.success('Listing deleted successfully!', {
        style: {
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        },
      });
      setShowActionsFor(null);
    }
  };

  const isUserListing = (seller: string) => {
    // Check if the seller matches the current user
    return seller === currentUserAddress;
  };

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 space-y-4 md:space-y-0">
        <div className="flex items-center space-x-4">
          <button className="glass px-4 py-2 rounded-xl flex items-center space-x-2 glass-hover transition-all">
            <Filter className="w-5 h-5 text-white" />
            <span className="text-white">Filters</span>
          </button>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="glass px-4 py-2 rounded-xl text-white bg-transparent focus:outline-none"
          >
            <option value="recent">Most Recent</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="popular">Most Popular</option>
          </select>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-all ${
              viewMode === 'grid' ? 'glass' : 'text-white/50 hover:text-white'
            }`}
          >
            <Grid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-all ${
              viewMode === 'list' ? 'glass' : 'text-white/50 hover:text-white'
            }`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Session Status Info */}
      {!isConnected && hiddenEscrowCount > 0 && (
        <div className="glass rounded-2xl p-4 mb-6 border border-blue-500/30">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Lock className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <p className="text-white font-medium">Connect Wallet to View More Items</p>
              <p className="text-white/60 text-sm">
                {hiddenEscrowCount} escrow listing{hiddenEscrowCount > 1 ? 's are' : ' is'} available for specific buyers. 
                Connect your wallet to see if any are reserved for you.
              </p>
            </div>
          </div>
        </div>
      )}

      {sortedItems.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <p className="text-white/70 text-lg">No items found matching your criteria</p>
          <p className="text-white/50 text-sm mt-2">
            {!isConnected && hiddenEscrowCount > 0 
              ? 'Connect your wallet to see escrow listings reserved for you'
              : 'Try adjusting your filters or search query'
            }
          </p>
        </div>
      ) : (
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
          : 'space-y-4'
        }>
          {sortedItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`glass rounded-2xl overflow-hidden group cursor-pointer relative ${
                viewMode === 'list' ? 'flex' : ''
              }`}
            >
              {/* Action Menu for User's Own Listings */}
              {isUserListing(item.seller) && (
                <div className="absolute top-4 right-4 z-20">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowActionsFor(showActionsFor === item.id ? null : item.id);
                    }}
                    className="glass p-2 rounded-full glass-hover"
                  >
                    <MoreVertical className="w-4 h-4 text-white" />
                  </button>
                  
                  {showActionsFor === item.id && (
                    <div className="absolute right-0 mt-2 glass rounded-xl overflow-hidden shadow-xl">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(item);
                        }}
                        className="flex items-center space-x-2 px-4 py-3 text-white hover:bg-white/10 transition-colors w-full text-left"
                      >
                        <Edit2 className="w-4 h-4" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(item);
                        }}
                        className="flex items-center space-x-2 px-4 py-3 text-red-400 hover:bg-white/10 transition-colors w-full text-left"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div 
                onClick={() => setSelectedItem(item)}
                className={`relative overflow-hidden ${
                  viewMode === 'list' ? 'w-48 h-32' : 'h-64'
                }`}
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 flex flex-col space-y-2">
                  {item.listingType === 'escrow' && (
                    <div className="glass px-3 py-1 rounded-full flex items-center space-x-1">
                      <Shield className="w-3 h-3 text-blue-300" />
                      <span className="text-xs text-blue-300 font-medium">Escrow</span>
                    </div>
                  )}
                  {item.listingType === 'standard' && (
                    <div className="glass px-3 py-1 rounded-full flex items-center space-x-1">
                      <Zap className="w-3 h-3 text-purple-300" />
                      <span className="text-xs text-purple-300 font-medium">Standard</span>
                    </div>
                  )}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-4 left-4 right-4 flex justify-between">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedItem(item);
                      }}
                      className="glass p-2 rounded-full glass-hover"
                    >
                      <Eye className="w-5 h-5 text-white" />
                    </button>
                    <button 
                      onClick={(e) => e.stopPropagation()}
                      className="glass p-2 rounded-full glass-hover"
                    >
                      <Heart className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>
              </div>
              
              <div 
                onClick={() => setSelectedItem(item)}
                className={`p-6 ${viewMode === 'list' ? 'flex-1' : ''}`}
              >
                <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-white/60 mb-3">
                  by {item.seller}
                  {isUserListing(item.seller) && (
                    <span className="ml-2 text-xs text-green-400">(You)</span>
                  )}
                </p>
                {viewMode === 'list' && (
                  <p className="text-sm text-white/70 mb-3">{item.description}</p>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-white">{item.price} SUI</span>
                  <button 
                    onClick={(e) => e.stopPropagation()}
                    className="glass px-4 py-2 rounded-xl flex items-center space-x-2 glass-hover transition-all"
                  >
                    <ShoppingCart className="w-4 h-4 text-white" />
                    <span className="text-white text-sm">
                      {item.listingType === 'escrow' ? 'Buy via Escrow' : 'Buy Now'}
                    </span>
                  </button>
                </div>
                {item.escrowBuyerAddress && isConnected && (
                  <div className="mt-2 flex items-center space-x-2">
                    <Shield className="w-3 h-3 text-green-400" />
                    <p className="text-xs text-green-400">
                      Reserved for you
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {selectedItem && (
        <ItemDetailModal
          item={selectedItem}
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}

      {editingItem && (
        <EditListingModal
          item={editingItem}
          isOpen={!!editingItem}
          onClose={() => setEditingItem(null)}
        />
      )}
    </>
  );
};

export default MarketplaceGrid;
