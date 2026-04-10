import StellarSDK from "@stellar/stellar-sdk";

const TESTNET_RPC_URL = "https://soroban-testnet.stellar.org";
const TESTNET_NETWORK_PASSPHRASE = "Test SDF Network ; September 2015";

let server = null;
let sourceKeypair = null;
let initialized = false;

export function initStellar() {
  if (initialized) return true;
  
  if (!process.env.STELLAR_SECRET_KEY) {
    console.warn("STELLAR_SECRET_KEY not configured - payments will be simulated");
    return false;
  }

  try {
    sourceKeypair = StellarSDK.Keypair.fromSecret(process.env.STELLAR_SECRET_KEY);
    server = new StellarSDK.RpcServer(TESTNET_RPC_URL);
    console.log(`Stellar initialized with account: ${sourceKeypair.publicKey()}`);
    initialized = true;
    return true;
  } catch (error) {
    console.error("Failed to initialize Stellar:", error);
    return false;
  }
}

// Initialize on module load
initStellar();

export async function getAccount() {
  if (!server || !sourceKeypair) {
    return null;
  }

  try {
    const account = await server.getAccount(sourceKeypair.publicKey());
    return account;
  } catch (error) {
    console.error("Failed to fetch account:", error);
    return null;
  }
}

export async function submitPayment(destination, amount, memo = "") {
  if (!server || !sourceKeypair) {
    return simulatePayment(destination, amount, memo);
  }

  try {
    const account = await getAccount();
    if (!account) {
      throw new Error("Failed to load account");
    }

    const transaction = new StellarSDK.TransactionBuilder(account, {
      fee: StellarSDK.BASE_FEE,
      networkPassphrase: TESTNET_NETWORK_PASSPHRASE,
    })
      .addOperation(
        StellarSDK.Operation.payment({
          destination: destination,
          asset: StellarSDK.Asset.native(),
          amount: amount.toString(),
        })
      )
      .addMemo(StellarSDK.Memo.text(memo))
      .setTimeout(30)
      .build();

    transaction.sign(sourceKeypair);

    const result = await server.sendTransaction(transaction);
    console.log("Payment submitted:", result);

    for (let i = 0; i < 10; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const status = await server.getTransactionStatus(result.hash);
      if (status.successful) {
        return {
          success: true,
          hash: result.hash,
          fee: transaction.fee,
          amount: amount,
          destination: destination,
          memo: memo,
          timestamp: new Date().toISOString(),
        };
      }
      if (status.failed) {
        throw new Error("Transaction failed");
      }
    }

    return {
      success: true,
      hash: result.hash,
      status: "pending",
      amount: amount,
      destination: destination,
    };
  } catch (error) {
    console.error("Payment failed:", error);
    return {
      success: false,
      error: error.message,
      amount: amount,
      destination: destination,
    };
  }
}

async function simulatePayment(destination, amount, memo) {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    success: true,
    simulated: true,
    hash: `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    amount: amount,
    destination: destination,
    memo: memo,
    timestamp: new Date().toISOString(),
    note: "Simulated payment - set STELLAR_SECRET_KEY for real transactions",
  };
}

export async function createEscrowHold(amount, memo) {
  if (!server || !sourceKeypair) {
    return {
      success: true,
      simulated: true,
      holdId: `hold_${Date.now()}`,
      amount: amount,
      memo: memo,
      timestamp: new Date().toISOString(),
    };
  }

  return {
    success: true,
    simulated: true,
    holdId: `hold_${Date.now()}`,
    amount: amount,
    memo: memo,
    note: "MPP escrow - simplified for demo",
  };
}

export async function settleHold(holdId, actualAmount) {
  if (!server || !sourceKeypair) {
    return {
      success: true,
      simulated: true,
      holdId: holdId,
      settledAmount: actualAmount,
      timestamp: new Date().toISOString(),
    };
  }

  return {
    success: true,
    simulated: true,
    holdId: holdId,
    settledAmount: actualAmount,
    note: "MPP settlement - simplified for demo",
  };
}

export { TESTNET_RPC_URL, TESTNET_NETWORK_PASSPHRASE };
