<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Stripe secret API key (sk_...) — used to retrieve Checkout sessions for /Stripe/checkout/confirm
    |--------------------------------------------------------------------------
    */
    'secret' => env('STRIPE_SECRET_KEY'),

    /*
    |--------------------------------------------------------------------------
    | Stripe webhook signing secret (Dashboard → Webhooks → endpoint → Signing secret)
    | Used by POST /api/Stripe/webhook when Stripe sends events directly to Laravel.
    |--------------------------------------------------------------------------
    */
    'webhook_secret' => env('STRIPE_WEBHOOK_SECRET'),

    /*
    |--------------------------------------------------------------------------
    | Shared secret for POST /api/Stripe/webhook/ingest (optional Node /stripe forwarder).
    | Must match STRIPE_GATEWAY_INGEST_SECRET in the checkout microservice .env.
    |--------------------------------------------------------------------------
    */
    'gateway_ingest_secret' => env('STRIPE_GATEWAY_INGEST_SECRET'),

];
