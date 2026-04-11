import { NextResponse } from "next/server";
import { buildWorkflowQuote, buildWorkflowRun } from "../../lib/workflows";

export async function GET() {
  const results = {
    quote: null,
    run: null,
    errors: [],
  };
  
  try {
    // Step 1: Generate quote
    console.log("[Test] Generating quote...");
    const quote = await buildWorkflowQuote({
      workflowKey: "prospecting",
      objective: "Research 3 competitors for an AI coding assistant like Cursor.",
    });
    results.quote = {
      traceId: quote.traceId,
      status: quote.status,
      totalCost: quote.totalCost,
    };
    console.log("[Test] Quote generated:", quote.traceId);
    
    // Step 2: Run the workflow
    console.log("[Test] Starting workflow run...");
    const run = await buildWorkflowRun({
      quote: {
        ...quote,
        workflowKey: "prospecting",
        objective: quote.objective,
      },
    });
    
    results.run = {
      status: run.status,
      success: run.artifact?.executionDetails?.success,
      traceId: run.traceId,
      runId: run.runId,
      settledAt: run.settledAt,
      totalCost: run.totalCost,
      paymentStages: run.paymentStages,
      aiResult: run.artifact?.executionDetails,
      deliverables: run.artifact?.deliverables,
      error: run.artifact?.executionDetails?.success === false ? "AI failed" : null,
    };
    
    console.log("[Test] Run completed. Status:", run.status);
    console.log("[Test] AI Success:", run.artifact?.executionDetails?.success);
    
  } catch (error) {
    console.error("[Test] Error:", error);
    results.errors.push(error.message);
    results.errors.push(error.stack);
  }
  
  return NextResponse.json(results);
}
