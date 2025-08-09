// Contract configuration for Sui Escrow Marketplace
// UPDATE THESE VALUES AFTER DEPLOYING YOUR CONTRACT TO TESTNET

export const CONTRACT_CONFIG = {
  // The address where your contract is deployed on testnet
  // This is the package ID from your deployment
  PACKAGE_ID: '0x01a8a03a1cf2d40c228ec3c844f71c04e568c3fb5cdc351a3e549ecd900fdff3',
  
  // The module name from your contract
  MODULE_NAME: 'escrow_marketplace',
  
  // Network configuration
  NETWORK: 'testnet', // 'testnet', 'devnet', 'mainnet'
  
  // Sui clock object ID (this is standard across all networks)
  CLOCK_OBJECT_ID: '0x6',
  
  // Gas budget for transactions (in MIST)
  DEFAULT_GAS_BUDGET: 10000000, // 0.01 SUI
};

// Helper function to get the full module path
export const getModulePath = () => {
  return `${CONTRACT_CONFIG.PACKAGE_ID}::${CONTRACT_CONFIG.MODULE_NAME}`;
};

// Helper function to get the full function path
export const getFunctionPath = (functionName: string) => {
  return `${getModulePath()}::${functionName}`;
};

// Available functions in your contract
export const CONTRACT_FUNCTIONS = {
  LIST: 'list',
  BUY: 'buy',
  OPEN_DISPUTE: 'open_dispute',
  BUYER_CANCEL: 'buyer_cancel',
  SELLER_SETTLE: 'seller_settle',
} as const; 