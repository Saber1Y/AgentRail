import { NextResponse } from "next/server";

export async function GET() {
  const stellarSecret = process.env.STELLAR_SECRET_KEY;
  const stellarPublic = process.env.STELLAR_PUBLIC_KEY;
  const openRouterKey = process.env.OPENROUTER_API_KEY;
  
  const results = {
    stellar: {
      hasSecret: !!stellarSecret,
      hasPublic: !!stellarPublic,
      secretPrefix: stellarSecret ? stellarSecret.substring(0, 8) + "..." : "none",
      publicKey: stellarPublic || "none",
    },
    openRouter: {
      hasKey: !!openRouterKey,
      keyPrefix: openRouterKey ? openRouterKey.substring(0, 15) + "..." : "none",
    },
    testPayments: [],
  };
  
  // Test payment if we have keys
  if (stellarSecret) {
    try {
      const StellarSDK = (await import("@stellar/stellar-sdk")).default;
      const keypair = StellarSDK.Keypair.fromSecret(stellarSecret);
      
      results.stellar.keypairPublic = keypair.publicKey();
      results.stellar.keypairMatch = keypair.publicKey() === stellarPublic;
      
      // Check account balance
      const accountResponse = await fetch(`https://horizon-testnet.stellar.org/accounts/${keypair.publicKey()}`);
      if (accountResponse.ok) {
        const accountData = await accountResponse.json();
        results.stellar.balance = accountData.balances?.find(b => b.asset_type === "native")?.balance || "0";
        results.stellar.accountExists = true;
      } else {
        results.stellar.error = "Account not found on testnet";
        results.stellar.accountExists = false;
      }
    } catch (error) {
      results.stellar.error = error.message;
    }
  }
  
  return NextResponse.json(results);
}
