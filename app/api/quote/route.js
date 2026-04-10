import { NextResponse } from "next/server";
import { buildWorkflowQuote, workflowCases } from "../../lib/workflows";

function isValidWorkflowKey(value) {
  return typeof value === "string" && workflowCases.some((item) => item.key === value);
}

export async function POST(request) {
  let payload;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Send JSON with workflowKey and objective." },
      { status: 400 }
    );
  }

  const workflowKey = typeof payload?.workflowKey === "string" ? payload.workflowKey : "";
  const objective = typeof payload?.objective === "string" ? payload.objective : "";

  if (!isValidWorkflowKey(workflowKey)) {
    return NextResponse.json(
      { error: "Choose a valid workflow profile." },
      { status: 400 }
    );
  }

  if (!objective.trim()) {
    return NextResponse.json(
      { error: "Describe the job you want the agent to do." },
      { status: 400 }
    );
  }

  const quote = await buildWorkflowQuote({ workflowKey, objective });

  return NextResponse.json({
    quote,
  });
}
