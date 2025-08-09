# Sui Marketplace Object ID Guide

## Understanding the Object ID Error

The error you encountered:

```
Error listing item: TRPCClientError: The following input objects are invalid: {"code":"notExists","object_id":"0x009dbb508e794eb50742eea55b7eb02a2a5ea64f1ec49028effc8340cbab18f1"}
```

This occurs because the Sui smart contract expects you to provide an **actual Sui object ID** that you own, not a randomly generated one.

## What is a Sui Object ID?

A Sui object ID is a unique identifier for objects on the Sui blockchain. These can be:

- **NFTs** (Non-Fungible Tokens)
- **Custom objects** created by smart contracts
- **Coins** and other digital assets
- **Any object** that implements the `store + key` abilities

## How to Get Real Object IDs

### Option 1: Use Existing Objects from Your Wallet

1. Connect your wallet to the marketplace
2. Check if you have any NFTs or objects
3. Use their object IDs in the listing

### Option 2: Create a Test Object

You can create a simple test object using the Sui CLI or SDK:

```bash
# Using Sui CLI
sui client call \
  --package 0x2 \
  --module object \
  --function new \
  --args "test data" \
  --gas-budget 10000000
```

### Option 3: Use Sui Explorer

1. Go to [Sui Explorer](https://suiexplorer.com/)
2. Search for objects or browse your wallet
3. Copy object IDs from objects you own

## Current Implementation

The marketplace currently uses a placeholder object ID:

```typescript
const placeholderObjectId =
  "0x0000000000000000000000000000000000000000000000000000000000000000";
```

This will always fail because it's not a real object. You need to replace this with an actual object ID.

## How to Fix the Error

### For Testing Purposes:

1. **Create a simple test object** first using Sui CLI or SDK
2. **Use that object's ID** in your listing
3. **Make sure you own the object** (it's in your wallet)

### For Production:

1. **Integrate with your NFT collection** or digital assets
2. **Use real object IDs** from your smart contracts
3. **Implement proper object validation**

## Example Workflow

1. **Create a test object:**

   ```bash
   sui client call --package 0x2 --module object --function new --args "test item" --gas-budget 10000000
   ```

2. **Get the object ID** from the transaction result

3. **Use that object ID** in your marketplace listing

4. **The listing should now work** because the object exists and you own it

## Important Notes

- **Object must exist** on the blockchain
- **You must own the object** (be the sender of the transaction)
- **Object must have `store + key` abilities** (required by the smart contract)
- **Testnet objects** are separate from mainnet objects

## Next Steps

1. Create a real test object using Sui CLI/SDK
2. Replace the placeholder object ID with the real one
3. Test the listing functionality
4. Implement proper object management in your frontend

## Support

If you continue to have issues:

1. Check that the object ID is valid (64 hex characters starting with 0x)
2. Verify the object exists on the blockchain
3. Ensure you own the object
4. Check the Sui network (testnet/mainnet) matches your deployment
