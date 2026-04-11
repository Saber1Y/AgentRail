import crypto from "node:crypto";
import StellarSDK from "@stellar/stellar-sdk";
import { executeWorkflow } from "./services/ai-agent.js";
import { createEscrowHold } from "./services/stellar.js";

const HORIZON_TESTNET_URL = "https://horizon-testnet.stellar.org";

async function submitPayment(destination, amount, memo) {
  const secretKey = process.env.STELLAR_SECRET_KEY;
  if (!secretKey) {
    return { success: true, simulated: true, hash: `sim_${Date.now()}` };
  }
  
  try {
    const keypair = StellarSDK.Keypair.fromSecret(secretKey);
    const accountResponse = await fetch(`${HORIZON_TESTNET_URL}/accounts/${keypair.publicKey()}`);
    const accountData = await accountResponse.json();
    const account = new StellarSDK.Account(keypair.publicKey(), accountData.sequence);
    
    const transaction = new StellarSDK.TransactionBuilder(account, {
      fee: "100",
      networkPassphrase: "Test SDF Network ; September 2015",
    })
      .addOperation(StellarSDK.Operation.payment({ destination, asset: StellarSDK.Asset.native(), amount: amount.toString() }))
      .addMemo(StellarSDK.Memo.text(memo.substring(0, 28)))
      .setTimeout(30)
      .build();
    
    transaction.sign(keypair);
    const xdr = transaction.toXDR();
    const submitResponse = await fetch(`${HORIZON_TESTNET_URL}/transactions`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `tx=${encodeURIComponent(xdr)}`,
    });
    const result = await submitResponse.json();
    
    if (result.error) throw new Error(result.error);
    
    return { success: true, hash: result.hash, amount, destination, memo };
  } catch (error) {
    console.error("Payment error:", error.message);
    return { success: false, error: error.message };
  }
}

export const workflowCases = [
  {
    key: "prospecting",
    label: "Prospecting",
    route: "x402 + MPP + Stellar",
    title: "Find leads matching your criteria",
    summary: "AI-powered lead generation with real data enrichment.",
    paymentTiers: [
      { rail: "x402", purpose: "Unlock data sources", baseAmount: 0.05 },
      { rail: "MPP", purpose: "Agent execution session", baseAmount: 0.50 },
      { rail: "stellar", purpose: "Receipt anchoring", baseAmount: 0.01 },
    ],
  },
  {
    key: "procurement",
    label: "Procurement",
    route: "x402 + Stellar",
    title: "Compare vendors for your needs",
    summary: "AI-powered vendor research and comparison.",
    paymentTiers: [
      { rail: "x402", purpose: "Unlock comparison data", baseAmount: 0.05 },
      { rail: "x402", purpose: "Deep research", baseAmount: 0.25 },
      { rail: "stellar", purpose: "Receipt anchoring", baseAmount: 0.01 },
    ],
  },
  {
    key: "travel",
    label: "Travel",
    route: "MPP + Stellar",
    title: "Plan your trip",
    summary: "AI-powered travel planning with route optimization.",
    paymentTiers: [
      { rail: "MPP", purpose: "Search session", baseAmount: 0.30 },
      { rail: "MPP", purpose: "Route comparison", baseAmount: 0.20 },
      { rail: "stellar", purpose: "Receipt anchoring", baseAmount: 0.01 },
    ],
  },
];

export const defaultWorkflowKey = workflowCases[0].key;

export function getWorkflowCase(key) {
  return workflowCases.find((item) => item.key === key) ?? workflowCases[0];
}

function normalizeObjective(objective) {
  return typeof objective === "string"
    ? objective.trim().replace(/\s+/g, " ")
    : "";
}

function buildTraceId(workflowKey, objective) {
  return crypto
    .createHash("sha256")
    .update(`${workflowKey}:${objective}:${Date.now()}`)
    .digest("hex")
    .slice(0, 10)
    .toUpperCase();
}

function calculatePaymentAmounts(workflowKey, objectiveLength) {
  const template = getWorkflowCase(workflowKey);
  const lengthMultiplier = Math.max(1, objectiveLength / 50);
  
  return template.paymentTiers.map(tier => ({
    ...tier,
    amount: (tier.baseAmount * lengthMultiplier).toFixed(2),
  }));
}

function buildPaymentStages(tiers, payments = []) {
  const stellarPayments = payments.filter(p => p.memo?.startsWith("Settle:"));
  const hasStellarPayment = stellarPayments.length > 0;
  const stellarHash = stellarPayments[0]?.hash || null;
  
  return tiers.map((tier, index) => ({
    rail: tier.rail,
    label: tier.purpose,
    amount: `${tier.amount} XLM`,
    detail: `Payment for ${tier.rail} operation`,
    order: index + 1,
    status: (tier.rail === "stellar" && hasStellarPayment) ? "complete" : 
            (tier.rail === "stellar" ? "pending" : "queued"),
    txHash: tier.rail === "stellar" ? stellarHash : null,
  }));
}

export async function buildWorkflowQuote({ workflowKey, objective }) {
  const template = getWorkflowCase(workflowKey);
  const cleanedObjective = normalizeObjective(objective);
  const finalObjective = cleanedObjective || template.title;
  const traceId = buildTraceId(template.key, finalObjective);
  const paymentTiers = calculatePaymentAmounts(template.key, finalObjective.length);
  
  const totalCost = paymentTiers.reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const quote = {
    workflowKey: template.key,
    workflowLabel: template.label,
    objective: finalObjective,
    objectiveSummary: finalObjective.length > 100 
      ? `${finalObjective.slice(0, 100)}...` 
      : finalObjective,
    traceId,
    generatedAt: new Date().toISOString(),
    status: "quoted",
    paymentTiers,
    totalCost: `${totalCost.toFixed(2)} XLM`,
    paymentStages: buildPaymentStages(paymentTiers),
    deliverablesPreview: getDeliverablesPreview(template.key),
  };

  return quote;
}

function getDeliverablesPreview(workflowKey) {
  const previews = {
    prospecting: ["Lead shortlist", "Buying signals", "Next actions"],
    procurement: ["Vendor shortlist", "Risk analysis", "Decision factors"],
    travel: ["Route options", "Key considerations", "Booking recommendation"],
  };
  return previews[workflowKey] || previews.prospecting;
}

function buildRunId(traceId, workflowKey) {
  return `RUN-${traceId}-${workflowKey.toUpperCase()}`;
}

function transformAiResultToDeliverables(workflowKey, aiResult) {
  const result = aiResult.result || aiResult;
  
  switch (workflowKey) {
    case "prospecting":
      return [
        {
          title: "Lead Shortlist",
          items: result.leadShortlist || result.lead_shortlist || [],
        },
        {
          title: "Buying Signals",
          items: result.buyingSignals || result.buying_signals || [],
        },
        {
          title: "Next Actions",
          items: result.recommendedActions || result.recommended_actions || [],
        },
      ];
    
    case "procurement":
      return [
        {
          title: "Vendor Shortlist",
          items: result.vendorShortlist || result.vendor_shortlist || [],
        },
        {
          title: "Risk Analysis",
          items: result.riskNotes || result.risk_notes || [],
        },
        {
          title: "Decision Factors",
          items: result.decisionFactors || result.decision_factors || [],
        },
      ];
    
    case "travel":
      return [
        {
          title: "Route Options",
          items: result.routeOptions || result.route_options || [],
        },
        {
          title: "Key Considerations",
          items: result.keyConsiderations || result.key_considerations || [],
        },
        {
          title: "Booking Recommendation",
          items: result.recommendedBooking ? [result.recommendedBooking] : [],
        },
      ];
    
    default:
      return [
        { title: "Results", items: Object.values(result).flat().slice(0, 5) },
      ];
  }
}

export async function buildWorkflowRun({ quote }) {
  console.log("[Workflow] Starting buildWorkflowRun");
  console.log("[Workflow] Quote:", JSON.stringify(quote, null, 2));
  
  const template = getWorkflowCase(quote.workflowKey ?? quote.key);
  const objective = normalizeObjective(quote.objective) || template.title;
  const traceId = quote.traceId || buildTraceId(template.key, objective);
  const runId = buildRunId(traceId, template.key);
  
  const paymentTiers = quote.paymentTiers || calculatePaymentAmounts(template.key, objective.length);
  const payments = [];
  
  let escrowHold = null;
  let mppAmount = 0;
  
  for (const tier of paymentTiers) {
    if (tier.rail === "MPP") {
      mppAmount += parseFloat(tier.amount);
    }
  }

  console.log("[Workflow] MPP Amount:", mppAmount);
  
  if (mppAmount > 0) {
    escrowHold = await createEscrowHold(
      mppAmount.toString(),
      `MPP:${runId}`
    );
  }
  
  console.log("[Workflow] Executing AI workflow...");
  const aiResult = await executeWorkflow(template.key, objective);
  console.log("[Workflow] AI Result success:", aiResult.success);
  console.log("[Workflow] AI Result:", JSON.stringify(aiResult, null, 2));
  
  const finalCost = paymentTiers.reduce((sum, t) => sum + parseFloat(t.amount), 0);
  
  let settledAmount = "0";
  if (aiResult.success) {
    for (const tier of paymentTiers) {
      if (tier.rail === "stellar") {
        const payment = await submitPayment(
          process.env.STELLAR_PUBLIC_KEY,
          tier.amount,
          `Settle:${runId}`
        );
        payments.push(payment);
      }
    }
    settledAmount = finalCost.toFixed(2);
  }
  
  const deliverables = transformAiResultToDeliverables(template.key, aiResult);
  
  const highlightItems = deliverables.flatMap(d => d.items).slice(0, 5);
  
  return {
    workflowKey: template.key,
    workflowLabel: template.label,
    runId,
    traceId,
    objective,
    status: aiResult.success ? "settled" : "partial",
    settledAt: new Date().toISOString(),
    settlementId: `XLM-${runId}`,
    totalCost: `${settledAmount} XLM`,
    paymentStages: buildPaymentStages(paymentTiers, payments),
    escrowHoldId: escrowHold?.holdId || null,
    escrowAmount: mppAmount > 0 ? `${mppAmount.toFixed(2)} XLM` : null,
    artifact: {
      headline: `${template.label} Result`,
      summary: aiResult.success 
        ? `Successfully processed: ${objective}`
        : `Partial result: ${objective}`,
      highlights: highlightItems,
      deliverables: deliverables,
      rawResult: aiResult.result || null,
      executionDetails: {
        success: aiResult.success,
        simulated: aiResult.simulated || false,
        tokensUsed: aiResult.usage?.totalTokens || 0,
        executedAt: aiResult.executedAt,
      },
    },
    runSummary: aiResult.success 
      ? `Payment settled and ${deliverables.length} result blocks are ready.`
      : `Partial execution - some deliverables may be incomplete.`,
    receipt: {
      id: runId,
      traceId,
      workflow: template.label,
      objective: objective,
      totalAmount: `${finalCost.toFixed(2)} XLM`,
      settledAmount: `${settledAmount} XLM`,
      timestamp: new Date().toISOString(),
      transactions: payments, // Return all payments, filter in UI
    },
  };
}
