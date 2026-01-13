Payoneer integration — setup & deployment
========================================

This file explains how to configure Payoneer checkout + webhook for this project.

1) Environment variables (Render)
---------------------------------
- `PAYONEER_CHECKOUT_URL_TEMPLATE` — required. Template must contain `{token}` placeholder.
  Example: `https://link.payoneer.com/Token?t={token}&src=wpl`

- `PAYONEER_WEBHOOK_SECRET` — required. Shared secret used to validate webhook signatures.

Other env vars already used by app:
- `DATABASE_URL`, `JWT_SECRET`, `OPENAI_API_KEY`, `EMAIL_USER`, `EMAIL_PASS`, etc.

2) Render setup (quick steps)
-----------------------------
1. Go to your Render service (backend) → Environment.
2. Add the variables above (use `Plaintext` or secret type in Render UI).
3. Save and redeploy the service.

3) Payoneer dashboard
---------------------
1. In Payoneer, create a checkout link or integration that performs a redirect to `https://link.payoneer.com/Token?t=<token>&...`.
2. Configure a Webhook in Payoneer to POST JSON to: `https://<your-backend-domain>/payment/webhook`.
   - Content-Type: `application/json`
   - Secret: set this to the same value as `PAYONEER_WEBHOOK_SECRET` in Render.

4) How the flow works (server implementation)
--------------------------------------------
- When frontend requests `POST /payment/create-checkout-session` (authenticated), server:
  1. Creates a `Transaction` row with `status = PENDING` and generates a random `externalId` token.
  2. Builds the checkout URL by replacing `{token}` in `PAYONEER_CHECKOUT_URL_TEMPLATE`.
  3. Returns `{ url, token }` to frontend.

- User completes payment on Payoneer site. Payoneer sends a webhook to `/payment/webhook` with the same token.
- Server validates webhook signature (using `PAYONEER_WEBHOOK_SECRET`), finds corresponding `Transaction` by `externalId`, marks it `COMPLETED`, and increments `User.balance`.

5) Important notes & troubleshooting
-----------------------------------
- If Payoneer requires server-side token/session creation (i.e., you must call Payoneer API to create a checkout token), you must provide API credentials. In that case, we must modify `createCheckoutSession` to first call Payoneer API and use their returned token.
- If webhook requests are failing with `Invalid signature`, verify secret matches and that Render forwards raw body (we added `express.raw` for `/payment/webhook`).
- Use test/sandbox Payoneer credentials first.
