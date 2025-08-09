import React, { useState } from 'react';
import { ConnectButton } from '@mysten/dapp-kit';
import { Search, ShoppingBag, Plus, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from '../context/SessionContext';

interface HeaderProps {
  onCreateListing: () => void;
  onSearch: (query: string) => void;
  onCategoryChange: (category: string) => void;
}

const Header: React.FC<HeaderProps> = ({ onCreateListing, onSearch, onCategoryChange }) => {
  const [searchValue, setSearchValue] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { currentUserAddress, isConnected } = useSession();

  const categories = [
    { id: 'all', name: 'All Items' },
    { id: 'art', name: 'Digital Art' },
    { id: 'collectibles', name: 'Collectibles' },
    { id: 'gaming', name: 'Gaming' },
    { id: 'music', name: 'Music' },
    { id: 'domains', name: 'Domains' },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchValue);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <header className="glass sticky top-0 z-50 border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <ShoppingBag className="w-8 h-8 text-white" />
            <span className="text-2xl font-bold text-white">SuiMarket</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => onCategoryChange(category.id)}
                className="text-white/80 hover:text-white transition-colors"
              >
                {category.name}
              </button>
            ))}
          </nav>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center">
            <div className="relative">
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search marketplace..."
                className="glass px-4 py-2 pr-10 rounded-full text-white placeholder-white/50 w-64 focus:outline-none focus:ring-2 focus:ring-white/30"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2"
              >
                <Search className="w-5 h-5 text-white/70" />
              </button>
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <button
              onClick={onCreateListing}
              className="hidden md:flex items-center space-x-2 glass px-4 py-2 rounded-full glass-hover transition-all"
            >
              <Plus className="w-5 h-5 text-white" />
              <span className="text-white">Create Listing</span>
            </button>
            
            <div className="hidden md:block">
              <ConnectButton />
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden text-white"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden py-4 border-t border-white/10"
            >
              <div className="space-y-4">
                {/* Mobile Search */}
                <form onSubmit={handleSearch} className="mb-4">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      placeholder="Search marketplace..."
                      className="glass px-4 py-2 pr-10 rounded-full text-white placeholder-white/50 w-full focus:outline-none focus:ring-2 focus:ring-white/30"
                    />
                    <button
                      type="submit"
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                    >
                      <Search className="w-5 h-5 text-white/70" />
                    </button>
                  </div>
                </form>

                {/* Mobile Categories */}
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => {
                      onCategoryChange(category.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className="block w-full text-left text-white/80 hover:text-white transition-colors py-2"
                  >
                    {category.name}
                  </button>
                ))}

                {/* Mobile Actions */}
                <button
                  onClick={() => {
                    onCreateListing();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center space-x-2 glass px-4 py-2 rounded-full glass-hover transition-all w-full justify-center"
                >
                  <Plus className="w-5 h-5 text-white" />
                  <span className="text-white">Create Listing</span>
                </button>

                <div className="pt-2">
                  <ConnectButton />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default Header;
