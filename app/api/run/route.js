import { NextResponse } from "next/server";
import { buildWorkflowRun, workflowCases } from "../../lib/workflows";

function isValidWorkflowKey(value) {
  return typeof value === "string" && workflowCases.some((item) => item.key === value);
}

export async function POST(request) {
  let payload;

  try {
    payload = await request.json();
  } catch (error) {
    return NextResponse.json(
      { error: "Send JSON with a quote payload." },
      { status: 400 }
    );
  }

  const quote = payload?.quote;
  const workflowKey = typeof quote?.workflowKey === "string" ? quote.workflowKey : quote?.key;
  const traceId = typeof quote?.traceId === "string" ? quote.traceId : "";
  const objective = typeof quote?.objective === "string" ? quote.objective : "";

  if (!quote || !isValidWorkflowKey(workflowKey) || !traceId || !objective.trim()) {
    return NextResponse.json(
      { error: "Generate a valid quote before starting the paid run." },
      { status: 400 }
    );
  }

  try {
    console.log("[API/Run] Starting paid run...");
    console.log("[API/Run] Quote received:", { workflowKey, traceId, objective });
    
    const run = await buildWorkflowRun({
      quote: {
        ...quote,
        workflowKey,
        objective,
      },
    });

    console.log("[API/Run] Run completed, status:", run.status);
    console.log("[API/Run] Returning run:", JSON.stringify(run, null, 2));

    return NextResponse.json({
      run,
    });
  } catch (error) {
    console.error("[API/Run] Build workflow run error:", error);
    console.error("[API/Run] Stack:", error.stack);
    return NextResponse.json(
      { error: `Run failed: ${error.message}` },
      { status: 500 }
    );
  }
}
