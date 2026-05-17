// Netlify Function: AI tasks via the Anthropic Claude API
//
// Two modes:
//   - summary       → concise summary of a creative brief
//   - reverse-brief → extract structured fields + clarification email
//
// The ANTHROPIC_API_KEY env var must be set on Netlify.
// Never expose it to the frontend.

import Anthropic from '@anthropic-ai/sdk';

const SUMMARY_PROMPT = (briefText) => `You are summarising a creative project brief for a freelancer's records. Read the brief below and write a concise 3-5 sentence summary in plain English. Focus on: what kind of project it is, who the client is, what's being delivered, and any notable constraints or context. Be neutral and professional.

Brief:
${briefText}

Summary:`;

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
      // Try to parse the JSON the model returned. If parsing fails, return an
      // error rather than half-cooked output.
      const cleaned = stripCodeFences(responseText);
      let parsed;
      try {
        parsed = JSON.parse(cleaned);
      } catch (e) {
        return jsonError(502, 'AI returned a non-JSON response. Please try again.');
      }
      return jsonOk({ brief: parsed.brief || {}, email: parsed.email || '' });
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
