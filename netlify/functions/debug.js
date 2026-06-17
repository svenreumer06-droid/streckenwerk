// Reine Diagnose-Funktion — zeigt OHNE den Schlüssel zu verraten, ob er ankommt.
// Danach wieder löschbar.

exports.handler = async () => {
  const k = process.env.GROQ_API_KEY || "";
  const allKeys = Object.keys(process.env).filter(k => k.toUpperCase().includes("GROQ"));
  return {
    statusCode: 200,
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      groq_key_present: !!k,
      groq_key_length: k.length,
      groq_key_starts_with: k ? k.slice(0, 4) : null,
      env_var_names_containing_groq: allKeys,
      node_version: process.version,
    }, null, 2),
  };
};
