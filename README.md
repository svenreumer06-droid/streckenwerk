# Streckenwerk – sicherer KI-Chat über Server-Proxy

Diese Variante hält deinen KI-Schlüssel **geheim auf dem Server**. Er steht
nirgends im Seitenquelltext und kann nicht von Fremden ausgelesen werden.

## Dateien
- `index.html` – die App (KI ist auf Proxy-Modus gestellt: `window.AI_PROXY = true`)
- `netlify/functions/chat.js` – kleiner Proxy, der mit deinem geheimen Schlüssel zu Claude weiterleitet
- `netlify.toml` – Netlify-Konfiguration (Publish-Ordner + Functions)

## Einrichtung (einmalig)

### 1. Auf GitHub laden
1. Auf github.com ein neues, leeres Repository anlegen (z. B. `streckenwerk`).
2. Diese drei Dateien/Ordner unverändert hineinlegen und committen
   (per Web-Upload „Add file → Upload files" reicht – achte darauf, dass der
   Ordner `netlify/functions/chat.js` erhalten bleibt).

### 2. Mit Netlify verbinden
- **Empfohlen (gleiche Adresse behalten):** In deiner bestehenden Netlify-Seite
  unter **Site configuration → Build & deploy → Continuous deployment → Link
  repository** das GitHub-Repo verbinden. So bleibt deine bisherige URL – und
  damit funktioniert die Google-Anmeldung ohne weitere Änderung.
- **Oder neu:** „Add new site → Import an existing project" → GitHub → Repo
  wählen. Build command: leer lassen. Publish directory: `.` (Punkt).
  ⚠️ Bei einer **neuen** URL musst du diese in Firebase unter
  **Authentication → Settings → Authorized domains** ergänzen, sonst geht die
  Google-Anmeldung dort nicht.

### 3. Geheimen Schlüssel hinterlegen
In Netlify: **Site configuration → Environment variables → Add a variable**
- Key: `ANTHROPIC_API_KEY`
- Value: dein Schlüssel von console.anthropic.com (API Keys)

Optional, für mehr Schutz:
- `ALLOWED_ORIGIN` = deine Seiten-URL (z. B. `https://deine-seite.netlify.app`)
  → der Proxy nimmt dann nur Anfragen von deiner Seite an.

### 4. Deploy auslösen
Nach dem Hinterlegen der Variable einmal neu deployen
(**Deploys → Trigger deploy → Deploy site**). Fertig.

## Test
Seite öffnen → Chat-Knopf unten links → z. B. schreiben:
„mach mir eine 7 km Runde im Wald, eher flach, und zeig mir drei Varianten".

## Hinweise
- Kosten entstehen pro KI-Anfrage über deinen Anthropic-Account. Setze im
  Anthropic-Dashboard am besten ein **Ausgabelimit**.
- Ohne erreichbaren Proxy fällt die App automatisch auf den eingebauten
  Assistenten (feste Muster, kostenlos) zurück.
- Möchtest du doch keinen KI-Chat: in `index.html` `window.AI_PROXY = false`
  setzen – dann läuft nur der eingebaute Assistent.
