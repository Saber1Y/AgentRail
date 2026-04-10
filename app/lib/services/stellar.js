import StellarSDK from "@stellar/stellar-sdk";

const HORIZON_TESTNET_URL = "https://horizon-testnet.stellar.org";

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
    console.log(`Stellar initialized with account: ${sourceKeypair.publicKey()}`);
    initialized = true;
    return true;
  } catch (error) {
    console.error("Failed to initialize Stellar:", error);
    return false;
  }
}

initStellar();

export async function submitPayment(destination, amount, memo = "") {
  if (!sourceKeypair) {
    return simulatePayment(destination, amount, memo);
  }

  try {
    const publicKey = sourceKeypair.publicKey();
    
    // Get account info
    const accountResponse = await fetch(`${HORIZON_TESTNET_URL}/accounts/${publicKey}`);
    const accountData = await accountResponse.json();
    
    // Create Account object
    const account = new StellarSDK.Account(publicKey, accountData.sequence);
    
    // Build transaction
    const transaction = new StellarSDK.TransactionBuilder(
      account,
      {
        fee: "100",
        networkPassphrase: "Test SDF Network ; September 2015",
      }
    )
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

    // Get XDR and URL encode
    const xdr = transaction.toXDR();
    
    // Submit
    const submitResponse = await fetch(
      `${HORIZON_TESTNET_URL}/transactions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `tx=${encodeURIComponent(xdr)}`,
      }
    );

    const result = await submitResponse.json();
    
    if (result.error || result.status === "ERROR") {
      throw new Error(result.error || result.detail);
    }

    return {
      success: true,
      hash: result.hash,
      fee: "100",
      amount: amount,
      destination: destination,
      memo: memo,
      timestamp: new Date().toISOString(),
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
  };
}

export async function createEscrowHold(amount, memo) {
  return {
    success: true,
    simulated: true,
    holdId: `hold_${Date.now()}`,
    amount: amount,
    memo: memo,
    timestamp: new Date().toISOString(),
  };
}

export async function settleHold(holdId, actualAmount) {
  return {
    success: true,
    simulated: true,
    holdId: holdId,
    settledAmount: actualAmount,
    timestamp: new Date().toISOString(),
  };
}
