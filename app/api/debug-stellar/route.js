import StellarSDK from "@stellar/stellar-sdk";
import { NextResponse } from "next/server";

const TESTNET_RPC_URL = "https://rpc.lightsail.network";

export async function GET() {
  const secretKey = process.env.STELLAR_SECRET_KEY;
  
  if (!secretKey) {
    return NextResponse.json({ error: "No secret key" });
  }
  
  try {
    const keypair = StellarSDK.Keypair.fromSecret(secretKey);
    const server = new StellarSDK.rpc.Server(TESTNET_RPC_URL);
    
    const account = await server.getAccount(keypair.publicKey());
    
    return NextResponse.json({
      success: true,
      publicKey: keypair.publicKey(),
      sequence: account.sequenceNumber(),
    });
  } catch (error) {
    return NextResponse.json({
      error: error.message,
      name: error.name,
    });
  }
}
