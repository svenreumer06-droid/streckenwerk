// Sicherer Proxy zur Anthropic-API.
// Der API-Schlüssel liegt ausschließlich serverseitig als Umgebungsvariable
// ANTHROPIC_API_KEY vor und gelangt NIE in den Browser/Quelltext.
//
// Optional: ALLOWED_ORIGIN auf die eigene Seiten-URL setzen
// (z. B. https://deine-seite.netlify.app), dann werden nur Anfragen von
// dort akzeptiert. Als zusätzlichen Schutz im Anthropic-Dashboard ein
// Ausgabelimit setzen.

exports.handler = async (event) => {
  const allowOrigin = process.env.ALLOWED_ORIGIN || "*";
  const headers = {
    "content-type": "application/json",
    "access-control-allow-origin": allowOrigin,
    "access-control-allow-headers": "content-type",
    "access-control-allow-methods": "POST, OPTIONS",
  };

  // Preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Nur POST erlaubt." }) };
  }

  // Optionaler Herkunfts-Check
  if (process.env.ALLOWED_ORIGIN) {
    const origin = event.headers.origin || event.headers.Origin || "";
    if (origin && origin !== process.env.ALLOWED_ORIGIN) {
      return { statusCode: 403, headers, body: JSON.stringify({ error: "Herkunft nicht erlaubt." }) };
    }
  }

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    return { statusCode: 503, headers, body: JSON.stringify({ error: "ANTHROPIC_API_KEY ist nicht gesetzt." }) };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Ungültiges JSON." }) };
  }

  // Nur erwartete Felder durchreichen, mit sicheren Grenzen
  const body = {
    model: typeof payload.model === "string" ? payload.model : "claude-haiku-4-5-20251001",
    max_tokens: Math.min(Math.max(parseInt(payload.max_tokens, 10) || 500, 1), 1024),
    system: typeof payload.system === "string" ? payload.system : "",
    messages: Array.isArray(payload.messages) ? payload.messages.slice(-12) : [],
  };

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(body),
    });
    const text = await r.text();   // Anthropic-Antwort unverändert zurückgeben
    return { statusCode: r.status, headers, body: text };
  } catch (e) {
    return { statusCode: 502, headers, body: JSON.stringify({ error: "Upstream-Fehler", detail: String(e) }) };
  }
};
