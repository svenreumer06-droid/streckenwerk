// Sicherer Proxy zu Groq (llama-3.3-70b-versatile — kostenlos).
// Der Schlüssel liegt NUR als Umgebungsvariable GROQ_API_KEY auf dem Server.

exports.handler = async (event) => {
  const headers = {
    "content-type": "application/json",
    "access-control-allow-origin": "*",
    "access-control-allow-headers": "content-type",
    "access-control-allow-methods": "POST, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers, body: "" };
  if (event.httpMethod !== "POST")    return { statusCode: 405, headers, body: JSON.stringify({ error: "Nur POST." }) };

  const key = process.env.GROQ_API_KEY;
  if (!key) return { statusCode: 503, headers, body: JSON.stringify({ error: "GROQ_API_KEY nicht gesetzt." }) };

  let payload;
  try { payload = JSON.parse(event.body || "{}"); }
  catch { return { statusCode: 400, headers, body: JSON.stringify({ error: "Ungültiges JSON." }) }; }

  // Groq nutzt das OpenAI-Format: system → messages[0]{role:"system"}
  const messages = [];
  if (payload.system) messages.push({ role: "system", content: payload.system });
  for (const m of (payload.messages || []).slice(-12)) messages.push(m);

  const body = {
    model: "llama-3.3-70b-versatile",
    max_tokens: Math.min(parseInt(payload.max_tokens, 10) || 500, 1024),
    messages,
  };

  try {
    const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "content-type": "application/json", "authorization": `Bearer ${key}` },
      body: JSON.stringify(body),
    });
    const data = await r.json();

    // Antwort ins Anthropic-Format übersetzen (was die App erwartet)
    const text = data?.choices?.[0]?.message?.content || "";
    const out = { content: [{ type: "text", text }] };
    return { statusCode: 200, headers, body: JSON.stringify(out) };
  } catch (e) {
    return { statusCode: 502, headers, body: JSON.stringify({ error: "Upstream-Fehler", detail: String(e) }) };
  }
};
