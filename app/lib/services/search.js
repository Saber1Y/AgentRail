import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function enrichProspectData(companies) {
  if (!process.env.OPENAI_API_KEY) {
    return companies.map(company => ({
      ...company,
      enriched: false,
      note: "Set OPENAI_API_KEY for real enrichment",
    }));
  }

  const enrichmentPrompt = `Research these companies and add relevant details:

Companies: ${companies.map(c => c.name).join(", ")}

For each company, return a JSON array with:
[{
  "name": "Company Name",
  "description": "What they do",
  "recentNews": "Any recent news or developments",
  "techStack": "Technologies they use",
  "fundingStage": "Funding status if known",
  "hiringSignals": "Signs they're growing"
}]

Return ONLY valid JSON.`;

  try {
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt: enrichmentPrompt,
      maxTokens: 1500,
    });

    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (error) {
    console.error("Enrichment failed:", error);
  }

  return companies.map(company => ({
    ...company,
    enriched: false,
  }));
}

export async function searchFlightOptions(from, to, dates) {
  return {
    routes: [
      {
        airline: " Ethiopian Airlines",
        route: `${from} → ${to}`,
        stops: 0,
        duration: "4h 30m",
        price: "$420",
        class: "Economy Flex",
      },
      {
        airline: " Kenya Airways",
        route: `${from} → ${to}`,
        stops: 0,
        duration: "4h 45m",
        price: "$380",
        class: "Economy",
      },
      {
        airline: " RwandAir",
        route: `${from} → ${to}`,
        stops: 1,
        duration: "6h 20m",
        price: "$290",
        class: "Economy",
      },
    ],
    note: "Connect real flight API (Amadeus/Skyscanner) for live prices",
  };
}

export async function searchVendorReviews(vendors) {
  if (!process.env.OPENAI_API_KEY) {
    return vendors.map(v => ({
      name: v,
      reviews: "Review data unavailable - configure AI key",
      rating: null,
    }));
  }

  const reviewPrompt = `Find and summarize user reviews for these vendors:

${vendors.join(", ")}

Return JSON array:
[{
  "name": "Vendor Name",
  "rating": "X/5 stars",
  "reviewCount": "Approximate number of reviews",
  "summary": "Common praise and complaints"
}]

Return ONLY valid JSON.`;

  try {
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt: reviewPrompt,
      maxTokens: 1500,
    });

    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (error) {
    console.error("Review search failed:", error);
  }

  return vendors.map(name => ({
    name,
    reviews: "Unable to fetch reviews",
    rating: null,
  }));
}

export async function enrichWithWebSearch(query) {
  if (!process.env.EXA_API_KEY && !process.env.OPENAI_API_KEY) {
    return {
      query,
      results: [],
      note: "Configure EXA_API_KEY or OPENAI_API_KEY for web search",
    };
  }

  if (process.env.EXA_API_KEY) {
    try {
      const response = await fetch("https://api.exa.ai/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.EXA_API_KEY}`,
        },
        body: JSON.stringify({
          query: query,
          numResults: 5,
          type: "auto",
        }),
      });

      const data = await response.json();
      return {
        query,
        results: data.results || [],
        sources: data.sources || [],
      };
    } catch (error) {
      console.error("Exa search failed:", error);
    }
  }

  if (process.env.OPENAI_API_KEY) {
    const searchPrompt = `Search the web for: "${query}"

Return JSON with:
{
  "query": "The search query",
  "results": [{
    "title": "Result title",
    "url": "URL",
    "snippet": "Brief description"
  }]
}

Return ONLY valid JSON.`;

    try {
      const { text } = await generateText({
        model: openai("gpt-4o"),
        prompt: searchPrompt,
        maxTokens: 1000,
      });

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error("AI search failed:", error);
    }
  }

  return { query, results: [], error: "Search unavailable" };
}
