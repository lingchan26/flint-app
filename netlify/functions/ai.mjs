// Netlify Function: AI tasks via the Anthropic Claude API
//
// Two modes:
//   - summary       → concise summary of a creative brief
//   - reverse-brief → extract structured fields + clarification email
//
// The ANTHROPIC_API_KEY env var must be set on Netlify.
// Never expose it to the frontend.

import Anthropic from '@anthropic-ai/sdk';

const SUMMARY_PROMPT = (briefText) => `You are summarising a freelance project for the freelancer's own records — like a concise internal notebook entry they can scan later.

The input below contains structured project details (client, stage, dates, value, etc.) followed by a free-form description and possibly notes and attachments. Read it all and write a 3-5 sentence summary in plain English that:
- Identifies the kind of project and the client
- Captures the key deliverables, timeline, and constraints worth remembering
- Notes anything unusual or risky (tight deadline, low win probability, unclear scope, etc.)
- Stays neutral and professional — no marketing fluff

Do not list the fields back. Synthesise them into flowing prose.

Project context:
${briefText}

Summary:`;

const EXTRACT_PROMPT = (briefText) => `You are extracting structured project fields from a client brief for a freelancer's project management tool.

The brief below is raw text — could be a client email, a written brief, or rough notes. Your job is to extract the following fields ONLY if they are clearly stated or strongly implied in the brief. If a field is not mentioned or you're guessing, return null for that field. Do NOT invent values.

Return your answer as valid JSON only — no preamble, no code fences, no explanation. Use this exact schema:

{
  "project_name": string | null,         // e.g. "Brand Refresh - Acme Coffee"
  "client": string | null,                // person or company name; prefer full name + company if both stated
  "service_type": string | null,          // one of: Branding, Web Design, Photography, Motion, Print, Digital, CGI, Advertising, Marketing, Other
  "value": number | null,                 // total project value in numbers only (no currency symbol, no commas); if a range like "10-15K" use the midpoint
  "start_date": string | null,            // YYYY-MM-DD format only
  "end_date": string | null,              // YYYY-MM-DD format only
  "description": string,                  // ALWAYS provide this — a 2-4 sentence summary of what the project actually is, deliverables, and key constraints. This is the only field that should never be null.
  "notes": string | null,                 // any risks, watch-outs, stakeholder issues, scope concerns, things the freelancer should remember
  "confidence": {
    "project_name": "high" | "medium" | "low" | null,
    "client": "high" | "medium" | "low" | null,
    "service_type": "high" | "medium" | "low" | null,
    "value": "high" | "medium" | "low" | null,
    "start_date": "high" | "medium" | "low" | null,
    "end_date": "high" | "medium" | "low" | null
  }
}

Confidence guide:
- "high" = stated clearly and unambiguously in the brief
- "medium" = stated but ambiguous or implied (e.g. "around 10-15K" for value)
- "low" = inferred from weak signals
- null = not in the brief at all (the field itself should also be null in this case)

Client brief:
${briefText}

Return JSON only:`;

const REVERSE_BRIEF_PROMPT = (briefText) => `You are an expert creative strategist helping a freelancer organise a client brief. The freelancer has provided text from a client (email, message, or rough notes). Your job is to:

1. Extract structured information into the fields below. If a field isn't covered, infer reasonably from context. Each field should be 1-3 sentences.
2. Generate a polite clarification email with 5-7 targeted follow-up questions the freelancer should ask before starting work.

Return your answer as valid JSON only, with this exact structure:
{
  "brief": {
    "brand": "...",
    "today": "...",
    "challenge": "...",
    "objective": "...",
    "deliverables": "...",
    "market": "...",
    "competitors": "...",
    "consumer": "...",
    "creative": "..."
  },
  "email": "Hi {{Client Name}},\\n\\n[email body with 5-7 numbered questions]\\n\\nBest,\\n{{Your Name}}"
}

Client brief text:
${briefText}

Return JSON only, no preamble:`;

export default async (request) => {
  // CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return jsonError(500, 'AI is not configured. ANTHROPIC_API_KEY missing on the server.');
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, 'Invalid JSON body');
  }

  const { mode, text } = body || {};
  if (!mode || !text) {
    return jsonError(400, 'Missing required fields: mode and text');
  }
  if (typeof text !== 'string' || text.trim().length === 0) {
    return jsonError(400, 'Text is empty');
  }
  if (text.length > 50000) {
    return jsonError(400, 'Text is too long (>50,000 characters). Trim it down first.');
  }

  let prompt;
  let maxTokens;
  if (mode === 'summary') {
    prompt = SUMMARY_PROMPT(text);
    maxTokens = 500;
  } else if (mode === 'reverse-brief') {
    prompt = REVERSE_BRIEF_PROMPT(text);
    maxTokens = 2500;
  } else if (mode === 'extract') {
    prompt = EXTRACT_PROMPT(text);
    maxTokens = 1500;
  } else {
    return jsonError(400, `Unknown mode: ${mode}`);
  }

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    // Use a model that's currently available; if the model id changes,
    // update here.
    const message = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }],
    });

    const responseText = (message.content || [])
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('\n')
      .trim();

    if (mode === 'reverse-brief') {
      const cleaned = stripCodeFences(responseText);
      let parsed;
      try {
        parsed = JSON.parse(cleaned);
      } catch (e) {
        return jsonError(502, 'AI returned a non-JSON response. Please try again.');
      }
      return jsonOk({ brief: parsed.brief || {}, email: parsed.email || '' });
    }

    if (mode === 'extract') {
      const cleaned = stripCodeFences(responseText);
      let parsed;
      try {
        parsed = JSON.parse(cleaned);
      } catch (e) {
        return jsonError(502, 'AI returned a non-JSON response. Please try again.');
      }
      // Defensive: always return a description even if the AI omitted it
      return jsonOk({
        project_name: parsed.project_name ?? null,
        client: parsed.client ?? null,
        service_type: parsed.service_type ?? null,
        value: parsed.value ?? null,
        start_date: parsed.start_date ?? null,
        end_date: parsed.end_date ?? null,
        description: parsed.description ?? '',
        notes: parsed.notes ?? null,
        confidence: parsed.confidence ?? {},
      });
    }

    return jsonOk({ summary: responseText });
  } catch (e) {
    const msg = e?.message || 'Unknown error calling Anthropic API';
    return jsonError(502, `AI request failed: ${msg}`);
  }
};

function stripCodeFences(s) {
  return s.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();
}

function jsonOk(payload) {
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
}

function jsonError(status, message) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
}
