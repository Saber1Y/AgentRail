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

  procurement: (objective) => `You are a procurement research agent. Your task is to compare vendors/solutions that match the user's need.

User's objective: "${objective}"

Research and return a JSON object with:
{
  "vendorShortlist": ["Top 4-6 vendor names"],
  "riskNotes": ["Key risks or concerns with each vendor"],
  "decisionFactors": ["What matters most for this decision"],
  "pricingOverview": "Brief pricing comparison summary"
}

Be specific and actionable. Return ONLY valid JSON.`,

  travel: (objective) => `You are a travel planning agent. Your task is to help plan travel based on the user's request.

User's objective: "${objective}"

Research and return a JSON object with:
{
  "routeOptions": ["Flight route suggestions with airlines"],
  "keyConsiderations": ["Important things to consider (visas, timing, etc.)"],
  "recommendedBooking": "What to book and why",
  "priceEstimate": "Rough price range estimate if available"
}

Be practical and actionable. Return ONLY valid JSON.`,
};

function extractJsonFromResponse(text) {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch {
      return null;
    }
  }
  return null;
}

async function callOpenRouter(prompt, model = "meta-llama/llama-3.1-8b-instruct") {
  const apiKey = process.env.OPENROUTER_API_KEY;
  
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY not configured");
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost:3000",
      "X-Title": "AgentRail",
    },
    body: JSON.stringify({
      model: model,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error");
    throw new Error(`OpenRouter error: ${response.status} - ${errorText}`);
  }

  const responseText = await response.text();
  
  if (!responseText || responseText.trim() === "") {
    throw new Error("Empty response from OpenRouter");
  }

  try {
    const data = JSON.parse(responseText);
    return data.choices[0]?.message?.content || "";
  } catch {
    throw new Error("Failed to parse OpenRouter response");
  }
}

export async function executeWorkflow(workflowKey, objective) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  
  if (!apiKey) {
    return simulateExecution(workflowKey, objective);
  }

  const promptTemplate = WORKFLOW_PROMPTS[workflowKey];
  if (!promptTemplate) {
    throw new Error(`Unknown workflow: ${workflowKey}`);
  }

  const prompt = promptTemplate(objective);

  try {
    const text = await callOpenRouter(prompt);
    const result_data = extractJsonFromResponse(text);

    if (!result_data) {
      console.warn("Failed to parse JSON from response, using simulated data");
      return simulateExecution(workflowKey, objective);
    }

    return {
      success: true,
      workflowKey,
      objective,
      result: result_data,
      executedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error("AI execution failed:", error);
    return {
      success: false,
      error: error.message,
      workflowKey,
      objective,
      executedAt: new Date().toISOString(),
    };
  }
}

function simulateExecution(workflowKey, objective) {
  const simulations = {
    prospecting: {
      leadShortlist: ["Northstar Pay", "Kite Ledger", "Orbit Ops", "Pioneer Stack"],
      buyingSignals: ["Recent Series B funding", "Hiring for growth roles", "New integration partnerships"],
      recommendedActions: ["Send personalized intro email", "Offer free trial", "Schedule demo call"],
    },
    procurement: {
      vendorShortlist: ["RelayDesk", "SignalHQ", "PulseQueue", "OrbitCare", "NexusFlow"],
      riskNotes: ["Integration complexity varies", "Enterprise onboarding takes 2-4 weeks", "Some missing features"],
      decisionFactors: ["Ease of setup", "Support coverage", "Pricing transparency", "Scalability"],
      pricingOverview: "Entry: $29/mo, Pro: $99/mo, Enterprise: Custom pricing",
    },
    travel: {
      routeOptions: ["Direct flights available", "Ethiopian Airlines via Addis", "Kenya Airways via Nairobi"],
      keyConsiderations: ["Visa requirements for transit", "Luggage allowances", "Flexible booking options"],
      recommendedBooking: "Book flexible fare on direct route for maximum convenience",
      priceEstimate: "$450-800 roundtrip depending on season",
    },
  };

  return {
    success: true,
    workflowKey,
    objective,
    result: simulations[workflowKey] || simulations.prospecting,
    simulated: true,
    executedAt: new Date().toISOString(),
    note: "Set OPENROUTER_API_KEY for real AI-powered execution",
  };
}
