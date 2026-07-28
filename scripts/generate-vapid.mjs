/**
 * Genera claves VAPID para Web Push.
 * Uso: npm run push:vapid
 */
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const webpush = require("web-push");

const keys = webpush.generateVAPIDKeys();
console.log(`
Añade en Vercel (Production / Preview / Development):

NEXT_PUBLIC_VAPID_PUBLIC_KEY=${keys.publicKey}
VAPID_PRIVATE_KEY=${keys.privateKey}
VAPID_SUBJECT=mailto:hello@imladris.online
`);
