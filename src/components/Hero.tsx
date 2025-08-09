import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Shield, Zap } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <motion.section 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="glass rounded-3xl p-12 mb-12 overflow-hidden relative"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10" />
      
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-5xl md:text-6xl font-bold text-white mb-6"
        >
          Welcome to <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">SuiMarket</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-xl text-white/80 mb-8"
        >
          The premier decentralized marketplace on Sui blockchain with secure escrow service
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12"
        >
          <div className="glass rounded-2xl p-6 glass-hover transition-all">
            <Shield className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Secure Escrow</h3>
            <p className="text-white/70">Smart contract-powered escrow ensures safe transactions</p>
          </div>
          
          <div className="glass rounded-2xl p-6 glass-hover transition-all">
            <Zap className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Instant Transactions</h3>
            <p className="text-white/70">Lightning-fast trades powered by Sui blockchain</p>
          </div>
          
          <div className="glass rounded-2xl p-6 glass-hover transition-all">
            <Sparkles className="w-12 h-12 text-pink-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Low Fees</h3>
            <p className="text-white/70">Minimal transaction costs for buyers and sellers</p>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default Hero;
