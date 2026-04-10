import StellarSDK from "@stellar/stellar-sdk";
import { NextResponse } from "next/server";

const TESTNET_RPC_URL = "https://soroban-testnet.stellar.org";

export async function GET() {
  const secretKey = process.env.STELLAR_SECRET_KEY;
  
  if (!secretKey) {
    return NextResponse.json({ error: "No secret key" });
  }
  
  try {
    // Test 1: Can we create a keypair?
    const keypair = StellarSDK.Keypair.fromSecret(secretKey);
    const publicKey = keypair.publicKey();
    
    // Test 2: Can we connect to the RPC?
    const server = new StellarSDK.RpcServer(TESTNET_RPC_URL);
    
    // Test 3: Can we fetch the account?
    const account = await server.getAccount(publicKey);
    
    return NextResponse.json({
      success: true,
      publicKey,
      sequence: account.sequenceNumber(),
      rpcUrl: TESTNET_RPC_URL,
    });
  } catch (error) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack?.substring(0, 500),
    });
  }
}
