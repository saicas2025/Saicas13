# WebApp GitHub Pages — Preventivo AI + Chat

Questa è la versione **solo frontend** da pubblicare su **GitHub Pages**.
Per funzionare deve chiamare un **backend esterno** (Replit / Vercel / Netlify Functions) che parla con l'AI.

## 1) Configura l'endpoint
- Apri `config.js` e sostituisci:
  ```js
  BACKEND_URL: "https://INSERISCI-QUI-IL-TUO-BACKEND"
  ```
  con l'URL del tuo backend, ad es. Replit: `https://preventivo-ai.username.repl.co`

## 2) Pubblica su GitHub Pages
- Crea un repo (es. `preventivo-ai`), carica questi file.
- Settings → Pages → Source: `main`, `/root` → Save.
- Link finale: `https://TuoUtente.github.io/preventivo-ai/`

## Backend di esempio
- Puoi usare il backend che abbiamo creato in precedenza (Replit `server.js`) o la funzione Netlify `ai.js`.
- Deve esporre due endpoint:
  - `POST /quote`  → { text, eurKg, eurH, eurMq } → { answer }
  - `POST /chat`   → { message } → { reply }
