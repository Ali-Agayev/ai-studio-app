Stripe integration — setup & deployment
====================================

This file explains how to configure Stripe Checkout + webhook for this project.

1) Environment variables (Render)
---------------------------------
- `STRIPE_SECRET_KEY` — secret key (sk_live_... for live). Keep it secret.
- `STRIPE_PUBLISHABLE_KEY` — publishable key (pk_live_...) for frontend use.
- `STRIPE_WEBHOOK_SECRET` — webhook signing secret (whsec_...); set after creating webhook endpoint in Stripe Dashboard.
- `FRONTEND_URL`, `STRIPE_SUCCESS_URL`, `STRIPE_CANCEL_URL` — optional redirect URLs.

2) Render setup (quick steps)
-----------------------------
1. Go to your Render service (backend) → Environment.
2. Add the variables above (use `Plaintext` or secret type in Render UI).
3. Save and redeploy the service.

3) Stripe dashboard
-------------------
1. Go to https://dashboard.stripe.com/ and log in.
2. Toggle to Live mode (you said you'll operate live). Use the Live keys.
3. Developers → API keys → copy `Secret key` and `Publishable key`.
4. Developers → Webhooks → Add endpoint:
   - Endpoint URL: `https://<your-backend-domain>/payment/webhook`
   - Events: `checkout.session.completed`
   - After creating endpoint, reveal the "Signing secret" and copy it to `STRIPE_WEBHOOK_SECRET` in Render.

4) How the flow works (server implementation)
--------------------------------------------
- Frontend calls `POST /payment/create-checkout-session` with JSON `{ amountCents, credits }`.
- Server creates a Stripe Checkout session (payment) and saves a `Transaction` with `externalId = session.id` and `status = PENDING`.
- Server returns `session.url` — frontend redirects user to Stripe Checkout.
- After successful payment Stripe sends `checkout.session.completed` webhook to `/payment/webhook`.
- Server validates signature, finds transaction by `externalId = session.id`, marks it `COMPLETED` and increments `user.balance` by `credits`.

5) Important notes
------------------
- Live mode charges real cards. Ensure you use live keys and double-check amounts before going live.
- Never commit `sk_live_...` or `whsec_...` to source control. Use Render env variables.
- Test with live cards only after thorough sandbox testing. You may prefer a short sandbox period.
