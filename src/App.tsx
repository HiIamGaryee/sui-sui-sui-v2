import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  SuiClientProvider,
  WalletProvider,
  createNetworkConfig,
} from "@mysten/dapp-kit";
import { getFullnodeUrl } from "@mysten/sui/client";
import { Toaster } from "react-hot-toast";
import { MarketplaceProvider } from "./context/MarketplaceContext";
import { SessionProvider } from "./context/SessionContext";
import Header from "./components/Header";
import Hero from "./components/Hero";
import FeaturedCarousel from "./components/FeaturedCarousel";
import MarketplaceGrid from "./components/MarketplaceGrid";
import CreateListingModal from "./components/CreateListingModal";
import BlockchainStatus from "./components/BlockchainStatus";
import Footer from "./components/Footer";
import "@mysten/dapp-kit/dist/index.css";

const { networkConfig } = createNetworkConfig({
  localnet: { url: getFullnodeUrl("localnet") },
  devnet: { url: getFullnodeUrl("devnet") },
  testnet: { url: getFullnodeUrl("testnet") },
  mainnet: { url: getFullnodeUrl("mainnet") },
});

const queryClient = new QueryClient();

function App() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
        <WalletProvider autoConnect>
          <SessionProvider>
            <MarketplaceProvider>
              <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
                <div className="gradient-mesh fixed inset-0 opacity-50" />

                <div className="relative z-10">
                  <Header
                    onCreateListing={() => setIsCreateModalOpen(true)}
                    onSearch={setSearchQuery}
                    onCategoryChange={setSelectedCategory}
                  />

                  <main className="container mx-auto px-4 py-8">
                    <Hero />

                    <section className="mt-16">
                      <h2 className="text-3xl font-bold text-white mb-8">
                        Blockchain Status
                      </h2>
                      <BlockchainStatus />
                    </section>

                    <section className="mt-16">
                      <h2 className="text-3xl font-bold text-white mb-8">
                        Featured Items
                      </h2>
                      <FeaturedCarousel />
                    </section>

                    <section className="mt-16">
                      <h2 className="text-3xl font-bold text-white mb-8">
                        Marketplace
                      </h2>
                      <MarketplaceGrid
                        searchQuery={searchQuery}
                        category={selectedCategory}
                      />
                    </section>
                  </main>

                  <Footer />
                </div>

                <CreateListingModal
                  isOpen={isCreateModalOpen}
                  onClose={() => setIsCreateModalOpen(false)}
                />

                <Toaster
                  position="bottom-right"
                  toastOptions={{
                    style: {
                      background: "rgba(255, 255, 255, 0.1)",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      color: "#fff",
                    },
                  }}
                />
              </div>
            </MarketplaceProvider>
          </SessionProvider>
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}

export default App;
