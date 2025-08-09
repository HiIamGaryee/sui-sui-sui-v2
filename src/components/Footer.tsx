import React from 'react';
import { Github, Twitter, MessageCircle, Mail, ShoppingBag } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="glass border-t border-white/10 mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <ShoppingBag className="w-8 h-8 text-white" />
              <span className="text-2xl font-bold text-white">SuiMarket</span>
            </div>
            <p className="text-white/70">
              The premier decentralized marketplace on Sui blockchain with secure escrow service.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Marketplace</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-white/70 hover:text-white transition-colors">Explore</a></li>
              <li><a href="#" className="text-white/70 hover:text-white transition-colors">Create</a></li>
              <li><a href="#" className="text-white/70 hover:text-white transition-colors">How it Works</a></li>
              <li><a href="#" className="text-white/70 hover:text-white transition-colors">Escrow Guide</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-white/70 hover:text-white transition-colors">Documentation</a></li>
              <li><a href="#" className="text-white/70 hover:text-white transition-colors">API</a></li>
              <li><a href="#" className="text-white/70 hover:text-white transition-colors">Smart Contracts</a></li>
              <li><a href="#" className="text-white/70 hover:text-white transition-colors">Support</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Connect</h3>
            <div className="flex space-x-4">
              <a href="#" className="glass p-3 rounded-full glass-hover transition-all">
                <Twitter className="w-5 h-5 text-white" />
              </a>
              <a href="#" className="glass p-3 rounded-full glass-hover transition-all">
                <Github className="w-5 h-5 text-white" />
              </a>
              <a href="#" className="glass p-3 rounded-full glass-hover transition-all">
                <MessageCircle className="w-5 h-5 text-white" />
              </a>
              <a href="#" className="glass p-3 rounded-full glass-hover transition-all">
                <Mail className="w-5 h-5 text-white" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-8 text-center">
          <p className="text-white/50">
            © 2024 SuiMarket. All rights reserved. Built with ChatAndBuild.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
