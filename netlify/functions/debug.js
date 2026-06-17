// Reine Diagnose-Funktion — zeigt OHNE den Schlüssel zu verraten, ob er ankommt.
// Danach wieder löschbar.

exports.handler = async () => {
  const k = process.env.GROQ_API_KEY || "";
  const allEnvNames = Object.keys(process.env).sort();
  const looksUserSet = allEnvNames.filter(n =>
    !n.startsWith("npm_") && !n.startsWith("NETLIFY_") && !n.startsWith("AWS_") &&
    !n.startsWith("LAMBDA_") && !n.startsWith("_") && !["PATH","LANG","HOME","TZ","NODE_OPTIONS","TASK_ROOT"].includes(n)
  );
  return {
    statusCode: 200,
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      groq_key_present: !!k,
      groq_key_length: k.length,
      total_env_vars: allEnvNames.length,
      likely_user_set_vars: looksUserSet,   // zeigt NAMEN, keine Werte
      node_version: process.version,
    }, null, 2),
  };
};
