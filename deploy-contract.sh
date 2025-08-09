#!/bin/bash

# Sui Escrow Marketplace Contract Deployment Script
# This script helps you deploy your smart contract to Sui testnet

echo "🚀 Sui Escrow Marketplace Contract Deployment"
echo "=============================================="

# Check if Sui CLI is installed
if ! command -v sui &> /dev/null; then
    echo "❌ Sui CLI is not installed. Please install it first:"
    echo "   https://docs.sui.io/build/install"
    exit 1
fi

echo "✅ Sui CLI found"

# Check if we're in the right directory
if [ ! -f "contract.txt" ]; then
    echo "❌ contract.txt not found. Please run this script from the project root."
    exit 1
fi

echo "✅ Contract source found"

# Create Move project directory
PROJECT_DIR="sui-escrow-marketplace"
if [ -d "$PROJECT_DIR" ]; then
    echo "⚠️  Project directory already exists. Removing..."
    rm -rf "$PROJECT_DIR"
fi

echo "📁 Creating Move project structure..."
sui move new "$PROJECT_DIR"
cd "$PROJECT_DIR"

# Create Move.toml
echo "📝 Creating Move.toml..."
cat > Move.toml << 'EOF'
[package]
name = "escrow_marketplace"
version = "0.0.1"
edition = "2024.beta"

[dependencies]
Sui = { git = "https://github.com/MystenLabs/sui.git", subdir = "crates/sui-framework/packages/sui-framework", rev = "framework/testnet" }

[addresses]
escrow_marketplace = "0x0"
EOF

# Create sources directory and copy contract
echo "📁 Creating sources directory..."
mkdir -p sources

echo "📝 Copying contract source..."
cat > sources/escrow_marketplace.move << 'EOF'
module 0x0::escrow_marketplace {
    struct Listing<T0: store + key> has store, key {
        id: 0x2::object::UID,
        seller: address,
        price: u64,
        protect_secs: u64,
        item: T0,
    }
    
    struct Escrow<T0: store + key> has store, key {
        id: 0x2::object::UID,
        seller: address,
        buyer: address,
        price: u64,
        protect_secs: u64,
        start_ms: u64,
        disputed: bool,
        item: T0,
        funds: 0x2::balance::Balance<0x2::sui::SUI>,
    }
    
    public entry fun buy<T0: store + key>(arg0: 0x2::coin::Coin<0x2::sui::SUI>, arg1: Listing<T0>, arg2: &0x2::clock::Clock, arg3: &mut 0x2::tx_context::TxContext) {
        let v0 = 0x2::tx_context::sender(arg3);
        assert!(0x2::coin::value<0x2::sui::SUI>(&arg0) >= arg1.price, 2);
        if (0x2::coin::value<0x2::sui::SUI>(&arg0) > 0) {
            0x2::transfer::public_transfer<0x2::coin::Coin<0x2::sui::SUI>>(arg0, v0);
        } else {
            0x2::coin::destroy_zero<0x2::sui::SUI>(arg0);
        };
        let Listing {
            id           : v1,
            seller       : v2,
            price        : _,
            protect_secs : _,
            item         : v5,
        } = arg1;
        0x2::object::delete(v1);
        let v6 = Escrow<T0>{
            id           : 0x2::object::new(arg3), 
            seller       : v2, 
            buyer        : v0, 
            price        : arg1.price, 
            protect_secs : arg1.protect_secs, 
            start_ms     : 0x2::clock::timestamp_ms(arg2), 
            disputed     : false, 
            item         : v5, 
            funds        : 0x2::coin::into_balance<0x2::sui::SUI>(0x2::coin::split<0x2::sui::SUI>(&mut arg0, arg1.price, arg3)),
        };
        0x2::transfer::public_transfer<Escrow<T0>>(v6, v0);
    }
    
    public entry fun buyer_cancel<T0: store + key>(arg0: Escrow<T0>, arg1: &0x2::clock::Clock, arg2: &mut 0x2::tx_context::TxContext) {
        assert!(within_window<T0>(&arg0, arg1), 5);
        assert!(!arg0.disputed, 6);
        let Escrow {
            id           : v0,
            seller       : v1,
            buyer        : v2,
            price        : _,
            protect_secs : _,
            start_ms     : _,
            disputed     : _,
            item         : v7,
            funds        : v8,
        } = arg0;
        0x2::transfer::public_transfer<0x2::coin::Coin<0x2::sui::SUI>>(0x2::coin::from_balance<0x2::sui::SUI>(v8, arg2), v2);
        0x2::object::delete(v0);
        0x2::transfer::public_transfer<T0>(v7, v1);
    }
    
    public entry fun list<T0: store + key>(arg0: T0, arg1: u64, arg2: u64, arg3: &mut 0x2::tx_context::TxContext) {
        assert!(arg1 > 0, 0);
        assert!(arg2 > 0, 1);
        let v0 = 0x2::tx_context::sender(arg3);
        let v1 = Listing<T0>{
            id           : 0x2::object::new(arg3), 
            seller       : v0, 
            price        : arg1, 
            protect_secs : arg2, 
            item         : arg0,
        };
        0x2::transfer::public_transfer<Listing<T0>>(v1, v0);
    }
    
    public entry fun open_dispute<T0: store + key>(arg0: &mut Escrow<T0>, arg1: &0x2::clock::Clock, arg2: &mut 0x2::tx_context::TxContext) {
        assert!(0x2::tx_context::sender(arg2) == arg0.buyer, 3);
        assert!(within_window<T0>(arg0, arg1), 4);
        arg0.disputed = true;
    }
    
    public entry fun seller_settle<T0: store + key>(arg0: Escrow<T0>, arg1: &0x2::clock::Clock, arg2: &mut 0x2::tx_context::TxContext) {
        assert!(!within_window<T0>(&arg0, arg1), 7);
        assert!(!arg0.disputed, 8);
        let Escrow {
            id           : v0,
            seller       : v1,
            buyer        : v2,
            price        : _,
            protect_secs : _,
            start_ms     : _,
            disputed     : _,
            item         : v7,
            funds        : v8,
        } = arg0;
        0x2::transfer::public_transfer<0x2::coin::Coin<0x2::sui::SUI>>(0x2::coin::from_balance<0x2::sui::SUI>(v8, arg2), v1);
        0x2::object::delete(v0);
        0x2::transfer::public_transfer<T0>(v7, v2);
    }
    
    fun within_window<T0: store + key>(arg0: &Escrow<T0>, arg1: &0x2::clock::Clock) : bool {
        0x2::clock::timestamp_ms(arg1) < arg0.start_ms + arg0.protect_secs * 1000
    }
}
EOF

echo "✅ Contract source copied"

# Check current network
echo "🌐 Checking current network..."
CURRENT_NETWORK=$(sui client active-address --json | jq -r '.activeNetwork' 2>/dev/null || echo "unknown")

if [ "$CURRENT_NETWORK" != "testnet" ]; then
    echo "⚠️  Current network is not testnet. Switching to testnet..."
    sui client switch --env testnet
else
    echo "✅ Already on testnet"
fi

# Check if wallet is connected
echo "🔐 Checking wallet connection..."
if ! sui client active-address &> /dev/null; then
    echo "❌ No wallet connected. Please connect your wallet first:"
    echo "   sui client new-address ed25519"
    echo "   # or import existing: sui client import-key ed25519 <private-key>"
    exit 1
fi

echo "✅ Wallet connected"

# Check balance
echo "💰 Checking wallet balance..."
BALANCE=$(sui client balance --json | jq -r '.[0].totalBalance' 2>/dev/null || echo "0")
echo "   Current balance: $BALANCE MIST"

# Build the package
echo "🔨 Building package..."
if ! sui move build; then
    echo "❌ Build failed. Please check your Move code."
    exit 1
fi

echo "✅ Build successful"

# Deploy to testnet
echo "🚀 Deploying to testnet..."
echo "   This may take a few minutes..."

DEPLOY_RESULT=$(sui client publish --gas-budget 10000000 --network testnet --json 2>/dev/null)

if [ $? -eq 0 ]; then
    PACKAGE_ID=$(echo "$DEPLOY_RESULT" | jq -r '.packageId')
    TRANSACTION_ID=$(echo "$DEPLOY_RESULT" | jq -r '.transactionId')
    
    echo "🎉 Deployment successful!"
    echo "   Package ID: $PACKAGE_ID"
    echo "   Transaction ID: $TRANSACTION_ID"
    echo ""
    echo "📝 Next steps:"
    echo "   1. Update src/config/contract.ts with Package ID: $PACKAGE_ID"
    echo "   2. Restart your React app"
    echo "   3. Test the integration"
    echo ""
    echo "🔍 View on Sui Explorer:"
    echo "   https://suiexplorer.com/network/testnet/package/$PACKAGE_ID"
    
    # Save deployment info
    echo "📁 Saving deployment info..."
    echo "Package ID: $PACKAGE_ID" > deployment-info.txt
    echo "Transaction ID: $TRANSACTION_ID" >> deployment-info.txt
    echo "Network: testnet" >> deployment-info.txt
    echo "Deployment Date: $(date)" >> deployment-info.txt
    
else
    echo "❌ Deployment failed. Please check the error above."
    exit 1
fi

echo ""
echo "✨ Deployment script completed!"
echo "   Check deployment-info.txt for details" 