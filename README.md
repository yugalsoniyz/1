# Bedrock Railway Client

This version uses `bedrock-protocol` 3.59.0 directly.

Edit `settings.json`, then deploy to Railway. Railway runs `npm install` and `npm start`.

This version adds detailed disconnect logging. After a disconnect, look for:
- `[BOT] DISCONNECT PACKET:`
- `[BOT] PLAY_STATUS:`
- `[PACKET]`
- `[BOT] ===== CONNECTION CLOSED =====`
- `[BOT] Close argument JSON:`

Do not share Microsoft passwords, access tokens, or authentication codes.

The client uses normal Microsoft authentication and does not bypass CAPTCHA, anti-bot systems, server verification, or authentication controls.
