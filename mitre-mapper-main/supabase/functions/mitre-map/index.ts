import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const systemPrompt = `You are a cybersecurity expert specializing in the MITRE ATT&CK framework. 
Given a security incident description, you must identify the most relevant MITRE ATT&CK techniques.

You MUST respond by calling the "map_techniques" function with your analysis. Do not respond with plain text.

For each technique, provide:
- tactic: The ATT&CK tactic category (e.g., "Initial Access", "Execution", "Persistence", "Privilege Escalation", "Defense Evasion", "Credential Access", "Discovery", "Lateral Movement", "Collection", "Command and Control", "Exfiltration", "Impact")
- techniqueId: The technique ID (e.g., "T1566.001")
- techniqueName: The technique name (e.g., "Phishing: Spearphishing Attachment")
- confidence: "high", "medium", or "low"
- reasoning: Brief explanation of why this technique applies

Identify 3-8 most relevant techniques. Be precise and accurate with technique IDs and names from the official MITRE ATT&CK framework.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { description } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Analyze this security incident and map it to MITRE ATT&CK techniques:\n\n${description}` },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "map_techniques",
              description: "Map the incident to MITRE ATT&CK techniques",
              parameters: {
                type: "object",
                properties: {
                  summary: { type: "string", description: "Brief summary of the incident" },
                  techniques: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        tactic: { type: "string" },
                        techniqueId: { type: "string" },
                        techniqueName: { type: "string" },
                        confidence: { type: "string", enum: ["high", "medium", "low"] },
                        reasoning: { type: "string" },
                      },
                      required: ["tactic", "techniqueId", "techniqueName", "confidence", "reasoning"],
                    },
                  },
                },
                required: ["summary", "techniques"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "map_techniques" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI analysis failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      return new Response(JSON.stringify({ error: "No analysis returned" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = JSON.parse(toolCall.function.arguments);
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("mitre-map error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
