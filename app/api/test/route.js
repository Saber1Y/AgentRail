import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  
  if (!apiKey) {
    return NextResponse.json({ error: "No API key" }, { status: 500 });
  }
  
  try {
    console.log("[Test] Testing OpenRouter with key:", apiKey.substring(0, 10) + "...");
    
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
        messages: [{ role: "user", content: "Say 'hello' in one word" }],
        max_tokens: 20,
      }),
    });
    
    const text = await response.text();
    console.log("[Test] OpenRouter response status:", response.status);
    console.log("[Test] OpenRouter response:", text.substring(0, 500));
    
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }
    
    return NextResponse.json({
      status: response.status,
      ok: response.ok,
      hasKey: true,
      keyPrefix: apiKey.substring(0, 10),
      response: data,
    });
  } catch (error) {
    console.error("[Test] OpenRouter error:", error);
    return NextResponse.json({
      error: error.message,
      hasKey: true,
    }, { status: 500 });
  }
}
