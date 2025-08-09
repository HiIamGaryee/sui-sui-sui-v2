import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Wallet,
  CheckCircle,
  XCircle,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { useSuiContract } from "../hooks/useSuiContract";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { CONTRACT_CONFIG } from "../config/contract";

const BlockchainStatus: React.FC = () => {
  const account = useCurrentAccount();
  const {
    isLoading,
    listings,
    escrows,
    fetchListings,
    fetchEscrows,
    isConnected,
  } = useSuiContract();

  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const refreshData = async () => {
    setLastRefresh(new Date());
    await Promise.all([fetchListings(), fetchEscrows()]);
  };

  useEffect(() => {
    if (isConnected) {
      refreshData();
    }
  }, [isConnected]);

  const getNetworkName = () => {
    return (
      CONTRACT_CONFIG.NETWORK.charAt(0).toUpperCase() +
      CONTRACT_CONFIG.NETWORK.slice(1)
    );
  };

  const getExplorerUrl = () => {
    return `https://suiexplorer.com/network/${CONTRACT_CONFIG.NETWORK}/package/${CONTRACT_CONFIG.PACKAGE_ID}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass p-6 rounded-2xl backdrop-blur-sm"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white flex items-center">
          <Wallet className="w-6 h-6 mr-2" />
          Blockchain Status
        </h3>
        <button
          onClick={refreshData}
          disabled={isLoading}
          className="flex items-center space-x-2 px-3 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          <span className="text-sm">Refresh</span>
        </button>
      </div>

      <div className="space-y-4">
        {/* Connection Status */}
        <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
          <div className="flex items-center space-x-3">
            {isConnected ? (
              <CheckCircle className="w-5 h-5 text-green-400" />
            ) : (
              <XCircle className="w-5 h-5 text-red-400" />
            )}
            <span className="text-white font-medium">Wallet Connection</span>
          </div>
          <span
            className={`text-sm ${
              isConnected ? "text-green-400" : "text-red-400"
            }`}
          >
            {isConnected ? "Connected" : "Disconnected"}
          </span>
        </div>

        {/* Network Status */}
        <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
          <span className="text-white font-medium">Network</span>
          <span className="text-blue-400 text-sm">{getNetworkName()}</span>
        </div>

        {/* Contract Status */}
        <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
          <span className="text-white font-medium">Contract</span>
          <div className="flex items-center space-x-2">
            <span className="text-green-400 text-xs font-mono">
              {CONTRACT_CONFIG.PACKAGE_ID.slice(0, 8)}...
              {CONTRACT_CONFIG.PACKAGE_ID.slice(-6)}
            </span>
            <a
              href={getExplorerUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Blockchain Data */}
        {isConnected && (
          <>
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <span className="text-white font-medium">Listings on Chain</span>
              <span className="text-purple-400 font-semibold">
                {listings.length}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <span className="text-white font-medium">Active Escrows</span>
              <span className="text-orange-400 font-semibold">
                {escrows.length}
              </span>
            </div>
          </>
        )}

        {/* Last Updated */}
        <div className="text-center text-white/60 text-sm">
          Last updated: {lastRefresh.toLocaleTimeString()}
        </div>

        {/* Connection Instructions */}
        {!isConnected && (
          <div className="p-4 bg-blue-500/20 rounded-lg border border-blue-500/30">
            <p className="text-blue-200 text-sm text-center">
              Connect your wallet to interact with the blockchain marketplace
            </p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            <span className="ml-2 text-white/70">
              Loading blockchain data...
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default BlockchainStatus;
