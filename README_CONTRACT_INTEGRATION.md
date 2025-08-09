# Sui Escrow Marketplace - Contract Integration Guide

This guide will help you deploy your Sui smart contract to testnet and connect it with your React frontend.

## 🚀 Prerequisites

1. **Sui CLI installed** - [Install Sui CLI](https://docs.sui.io/build/install)
2. **Sui wallet** (Sui Wallet, Sui Explorer, or any Sui-compatible wallet)
3. **Testnet SUI tokens** for gas fees
4. **Node.js and npm** for the React app

## 📋 Step 1: Deploy Smart Contract to Testnet

### 1.1 Prepare Your Contract

Your contract is already written in Move and located in `contract.txt`. You'll need to:

1. Create a proper Move project structure
2. Deploy it to Sui testnet

### 1.2 Create Move Project Structure

```bash
# Create a new Move project
mkdir sui-escrow-marketplace
cd sui-escrow-marketplace

# Initialize Move project
sui move new escrow_marketplace
cd escrow_marketplace
```

### 1.3 Create Move.toml

```toml
[package]
name = "escrow_marketplace"
version = "0.0.1"
edition = "2024.beta"

[dependencies]
Sui = { git = "https://github.com/MystenLabs/sui.git", subdir = "crates/sui-framework/packages/sui-framework", rev = "framework/testnet" }

[addresses]
escrow_marketplace = "0x0"
```

### 1.4 Create Source Files

Create `sources/escrow_marketplace.move` with your contract code from `contract.txt`.

### 1.5 Deploy to Testnet

```bash
# Build the package
sui move build

# Deploy to testnet
sui client publish --gas-budget 10000000 --network testnet
```

**Important**: Save the package ID from the deployment output. You'll need this for the frontend.

## 🔧 Step 2: Update Frontend Configuration

After deploying, update the contract configuration in `src/config/contract.ts`:

```typescript
export const CONTRACT_CONFIG = {
  // Replace with your actual package ID from deployment
  PACKAGE_ID: "YOUR_ACTUAL_PACKAGE_ID_HERE",

  MODULE_NAME: "escrow_marketplace",
  NETWORK: "testnet",
  CLOCK_OBJECT_ID: "0x6",
  DEFAULT_GAS_BUDGET: 10000000,
};
```

## 🎯 Step 3: Test the Integration

### 3.1 Start Your React App

```bash
npm run dev
```

### 3.2 Connect Wallet

1. Open your app in the browser
2. Click "Connect Wallet"
3. Connect your Sui wallet (make sure it's on testnet)

### 3.3 Test Creating a Listing

1. Click "Create Listing"
2. Fill out the form
3. Submit - this will create a transaction on the blockchain
4. Approve the transaction in your wallet

### 3.4 Test Buying an Item

1. Browse listings
2. Click on an item
3. Click "Buy"
4. Approve the transaction in your wallet

## 🔍 Step 4: Monitor Transactions

### 4.1 Sui Explorer

- Visit [Sui Explorer Testnet](https://suiexplorer.com/network/testnet)
- Search for your wallet address or transaction IDs
- View your deployed contract and its objects

### 4.2 Check Contract Objects

Your contract creates two main object types:

- **Listing**: Items available for purchase
- **Escrow**: Items in the escrow process

## 🛠️ Troubleshooting

### Common Issues

1. **"Package not found" error**

   - Verify the package ID in your config
   - Ensure you're on the correct network (testnet)

2. **"Insufficient gas" error**

   - Get more testnet SUI from [Sui Faucet](https://discord.gg/sui)
   - Increase gas budget in contract config

3. **"Object not found" error**

   - Check if the object ID exists on testnet
   - Verify the object type matches your contract

4. **Transaction fails**
   - Check the transaction details in Sui Explorer
   - Look for specific error messages
   - Verify your wallet has sufficient SUI

### Debug Mode

Enable debug logging in your browser console to see detailed transaction information.

## 📚 Additional Resources

- [Sui Documentation](https://docs.sui.io/)
- [Sui Move Examples](https://github.com/MystenLabs/sui/tree/main/examples)
- [Sui Discord](https://discord.gg/sui) for community support

## 🔐 Security Notes

- **Never commit private keys** to your repository
- **Use testnet** for development and testing
- **Test thoroughly** before deploying to mainnet
- **Keep your Move code secure** and well-tested

## 🎉 Next Steps

After successful integration:

1. **Add more features** like dispute resolution UI
2. **Implement proper error handling** for failed transactions
3. **Add transaction history** to your app
4. **Create admin functions** for marketplace management
5. **Deploy to mainnet** when ready

---

## 📝 Contract Functions Available

Your smart contract provides these functions:

- `list(item, price, protect_secs)` - List an item for sale
- `buy(payment, listing, clock)` - Purchase an item
- `open_dispute(escrow, clock)` - Open a dispute on an escrow
- `buyer_cancel(escrow, clock)` - Cancel escrow as buyer
- `seller_settle(escrow, clock)` - Settle escrow as seller

Each function is now integrated into your React frontend through the `useSuiContract` hook.
