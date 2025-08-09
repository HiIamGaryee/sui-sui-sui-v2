import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Heart, ShoppingCart } from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';

const FeaturedCarousel: React.FC = () => {
  const { items } = useMarketplace();
  const [currentIndex, setCurrentIndex] = React.useState(0);
  
  // Get the 5 most liked items as featured
  const featuredItems = [...items]
    .sort((a, b) => b.likes - a.likes)
    .slice(0, 5);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % featuredItems.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + featuredItems.length) % featuredItems.length);
  };

  React.useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [featuredItems.length]);

  if (featuredItems.length === 0) {
    return (
      <div className="glass rounded-3xl p-12 text-center">
        <p className="text-white/70 text-lg">No featured items available</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="overflow-hidden rounded-3xl">
        <motion.div
          className="flex"
          animate={{ x: `-${currentIndex * 100}%` }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          {featuredItems.map((item) => (
            <div key={item.id} className="w-full flex-shrink-0">
              <div className="glass rounded-3xl overflow-hidden">
                <div className="grid md:grid-cols-2 gap-8 p-8">
                  <div className="relative h-96 rounded-2xl overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                    {item.inEscrow && (
                      <div className="absolute top-4 left-4 glass px-4 py-2 rounded-full">
                        <span className="text-sm text-yellow-300 font-medium">In Escrow</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col justify-center">
                    <h3 className="text-4xl font-bold text-white mb-4">{item.title}</h3>
                    <p className="text-white/70 mb-6">{item.description}</p>
                    
                    <div className="flex items-center space-x-4 mb-6">
                      <span className="text-3xl font-bold text-white">{item.price} SUI</span>
                      <div className="flex items-center space-x-2 text-white/60">
                        <Heart className="w-5 h-5" />
                        <span>{item.likes}</span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-4">
                      <button className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 py-3 rounded-xl text-white font-semibold hover:from-purple-600 hover:to-blue-600 transition-all flex items-center justify-center space-x-2">
                        <ShoppingCart className="w-5 h-5" />
                        <span>Buy Now</span>
                      </button>
                      <button className="glass px-6 py-3 rounded-xl text-white font-semibold glass-hover transition-all">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
      
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 glass p-3 rounded-full glass-hover transition-all"
      >
        <ChevronLeft className="w-6 h-6 text-white" />
      </button>
      
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 glass p-3 rounded-full glass-hover transition-all"
      >
        <ChevronRight className="w-6 h-6 text-white" />
      </button>
      
      <div className="flex justify-center space-x-2 mt-6">
        {featuredItems.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-2 rounded-full transition-all ${
              index === currentIndex ? 'w-8 bg-white' : 'w-2 bg-white/30'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default FeaturedCarousel;
