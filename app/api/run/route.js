import { NextResponse } from "next/server";
import { buildWorkflowRun, workflowCases } from "../../lib/workflows";

function isValidWorkflowKey(value) {
  return typeof value === "string" && workflowCases.some((item) => item.key === value);
}

export async function POST(request) {
  let payload;

  try {
    payload = await request.json();
  } catch {
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

  const run = buildWorkflowRun({
    quote: {
      ...quote,
      workflowKey,
      objective,
    },
  });

  return NextResponse.json({
    run,
  });
}
