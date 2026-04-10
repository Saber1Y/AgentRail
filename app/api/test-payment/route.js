import { NextResponse } from "next/server";
import StellarSDK from "@stellar/stellar-sdk";

const HORIZON_TESTNET_URL = "https://horizon-testnet.stellar.org";

export async function GET() {
  const secretKey = process.env.STELLAR_SECRET_KEY;
  
  if (!secretKey) {
    return NextResponse.json({ error: "No secret key" });
  }
  
  try {
    const keypair = StellarSDK.Keypair.fromSecret(secretKey);
    const publicKey = keypair.publicKey();
    
    // Get account info
    const accountResponse = await fetch(`${HORIZON_TESTNET_URL}/accounts/${publicKey}`);
    const accountData = await accountResponse.json();
    const balance = accountData.balances?.find(b => b.asset_type === 'native')?.balance;
    
    // Create Account object for TransactionBuilder
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
          destination: publicKey,
          asset: StellarSDK.Asset.native(),
          amount: "0.0000001",
        })
      )
      .addMemo(StellarSDK.Memo.text("AgentRail test"))
      .setTimeout(30)
      .build();

    transaction.sign(keypair);

    // Get base64 XDR
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
    
    return NextResponse.json({
      success: !result.error,
      publicKey,
      balance,
      txHash: result.hash,
      error: result.error,
      result: result,
    });
  } catch (error) {
    return NextResponse.json({
      error: error.message,
      name: error.name,
    });
  }
}
