import { NextResponse } from "next/server";

const WORKFLOW_PROMPTS = {
  prospecting: (objective) => `You are a sales intelligence agent. Your task is to find potential customers (leads) that match the user's objective.

User's objective: "${objective}"

Research and return a JSON object with:
{
  "leadShortlist": ["Company names that match the criteria"],
  "buyingSignals": ["Observable signals suggesting these companies are in market"],
  "recommendedActions": ["Specific next steps to reach these leads"]
}

Focus on finding real, specific companies. Be concrete and actionable. Return ONLY valid JSON.`,
};

function extractJsonFromResponse(text) {
  console.log("[Debug] Raw response:", text);
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch (e) {
      console.log("[Debug] JSON parse failed:", e.message);
      return null;
    }
  }
  console.log("[Debug] No JSON match found");
  return null;
}

export async function GET() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  
  const objective = "Research 3 competitors for an AI coding assistant like Cursor.";
  const prompt = WORKFLOW_PROMPTS.prospecting(objective);
  
  console.log("[Debug] Sending prompt:", prompt);
  
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "AgentRail",
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3.1-8b-instruct",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 2000,
      }),
    });
    
    const text = await response.text();
    console.log("[Debug] Full response:", text);
    
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }
    
    const content = data?.choices?.[0]?.message?.content || "";
    const parsed = extractJsonFromResponse(content);
    
    return NextResponse.json({
      status: response.status,
      rawContent: content,
      parsedJson: parsed,
      parseSuccess: !!parsed,
      fullResponse: data,
    });
  } catch (error) {
    console.error("[Debug] Error:", error);
    return NextResponse.json({
      error: error.message,
    }, { status: 500 });
  }
}
