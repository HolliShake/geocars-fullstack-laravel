<?php

namespace App\Http\Controllers;

use App\Enum\TransactionTypeEnum;
use App\Models\Plan;
use App\Models\SubscriptionTransaction;
use App\Models\UserSubscription;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use OpenApi\Attributes as OA;

#[OA\PathItem(path: '/UserSubscription')]
class UserSubscriptionController extends Controller
{
    private const STRIPE_MIN_PHP_AMOUNT_MINOR = 5000;

    // ─── GET /api/UserSubscription/me ────────────────────────────────────────

    #[OA\Get(
        path: '/api/UserSubscription/me',
        summary: 'Get current user active subscription',
        description: 'Returns the authenticated user\'s active or most recent subscription with plan and transactions.',
        operationId: 'getMySubscription',
        tags: ['UserSubscription'],
        security: [['bearerAuth' => []]],
    )]
    #[OA\Response(
        response: 200,
        description: 'Subscription data',
        content: new OA\JsonContent(ref: '#/components/schemas/GetUserSubscriptionResponse200')
    )]
    #[OA\Response(response: 404, description: 'No subscription found')]
    public function mySubscription(Request $request): JsonResponse
    {
        $user = Auth::user();

        $subscription = UserSubscription::query()
            ->with(['plan', 'transactions'])
            ->where('user_id', $user->id)
            ->orderByDesc('id')
            ->first();

        if ($subscription === null) {
            return $this->notFound('No subscription found');
        }

        return $this->ok($subscription);
    }

    // ─── GET /api/UserSubscription/plans ─────────────────────────────────────

    #[OA\Get(
        path: '/api/UserSubscription/plans',
        summary: 'List available subscription plans',
        description: 'Returns all active plans that users can subscribe to.',
        operationId: 'getSubscriptionPlans',
        tags: ['UserSubscription'],
        security: [['bearerAuth' => []]],
    )]
    #[OA\Response(
        response: 200,
        description: 'List of plans',
        content: new OA\JsonContent(ref: '#/components/schemas/PaginatedPlanResponse200')
    )]
    public function plans(Request $request): JsonResponse
    {
        $plans = Plan::query()->where('active', true)->get();
        return $this->ok($plans);
    }

    // ─── POST /api/UserSubscription/subscribe ────────────────────────────────

    #[OA\Post(
        path: '/api/UserSubscription/subscribe',
        summary: 'Create Stripe Checkout session for a subscription plan',
        description: 'Creates a pending UserSubscription and a Stripe Checkout session. Redirect the user to checkout_url to complete payment.',
        operationId: 'subscribeToplan',
        tags: ['UserSubscription'],
        security: [['bearerAuth' => []]],
    )]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            required: ['plan_id', 'success_url', 'cancel_url'],
            properties: [
                new OA\Property(property: 'plan_id', type: 'integer', example: 1),
                new OA\Property(property: 'success_url', type: 'string', example: 'https://example.com/subscription/success'),
                new OA\Property(property: 'cancel_url', type: 'string', example: 'https://example.com/subscription'),
            ]
        )
    )]
    #[OA\Response(
        response: 200,
        description: 'Stripe Checkout URL returned',
        content: new OA\JsonContent(
            properties: [
                new OA\Property(property: 'success', type: 'boolean', example: true),
                new OA\Property(property: 'checkout_url', type: 'string', example: 'https://checkout.stripe.com/...'),
            ]
        )
    )]
    #[OA\Response(response: 422, description: 'Validation error')]
    #[OA\Response(response: 503, description: 'Stripe not configured')]
    public function subscribe(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'plan_id'     => ['required', 'integer', 'exists:plans,id'],
            'success_url' => ['required', 'string', 'url'],
            'cancel_url'  => ['required', 'string', 'url'],
        ]);

        $apiKey = config('stripe.secret');
        if (! is_string($apiKey) || $apiKey === '') {
            return response()->json(['message' => 'Stripe not configured on server'], 503);
        }

        $user = Auth::user();
        $plan = Plan::findOrFail($validated['plan_id']);

        // ── Free plan: activate immediately without Stripe ────────────────────
        if ((float) $plan->price <= 0) {
            $subscription = UserSubscription::create([
                'user_id'    => $user->id,
                'plan_id'    => $plan->id,
                'status'     => 'active',
                'expires_at' => now()->addDays(30),
            ]);

            SubscriptionTransaction::create([
                'user_subscription_id' => $subscription->id,
                'amount'               => 0,
                'type'                 => TransactionTypeEnum::PAYMENT->value,
            ]);

            return $this->ok([
                'checkout_url'    => null,
                'subscription_id' => $subscription->id,
                'session_id'      => null,
                'activated'       => true,
            ]);
        }

        // Create a pending subscription record
        $subscription = UserSubscription::create([
            'user_id' => $user->id,
            'plan_id' => $plan->id,
            'status'  => 'inactive',
        ]);

        $amountMinor = (int) round((float) $plan->price * 100);
        if ($amountMinor < self::STRIPE_MIN_PHP_AMOUNT_MINOR) {
            return response()->json([
                'message' => 'This plan amount is too low for Stripe Checkout. Please choose a plan worth at least PHP 50.00.',
            ], 422);
        }

        $successUrl  = rtrim($validated['success_url'], '/') . '?session_id={CHECKOUT_SESSION_ID}&subscription_id=' . $subscription->id;

        $stripeResponse = Http::withHeaders([
            'Authorization' => 'Bearer ' . $apiKey,
        ])->timeout(15)->asForm()->post('https://api.stripe.com/v1/checkout/sessions', [
            'payment_method_types[0]' => 'card',
            'mode'                    => 'payment',
            'line_items[0][price_data][currency]'                  => 'php',
            'line_items[0][price_data][product_data][name]'        => $plan->name . ' Subscription',
            'line_items[0][price_data][product_data][description]' => $plan->description,
            'line_items[0][price_data][unit_amount]'               => $amountMinor,
            'line_items[0][quantity]'                              => 1,
            'metadata[subscription_id]'                            => $subscription->id,
            'metadata[plan_id]'                                    => $plan->id,
            'metadata[user_id]'                                    => $user->id,
            'success_url'                                          => $successUrl,
            'cancel_url'                                           => $validated['cancel_url'],
        ]);

        if ($stripeResponse->failed()) {
            $subscription->delete();
            Log::error('UserSubscription: Stripe session creation failed.', [
                'body' => $stripeResponse->body(),
            ]);

            $message = $stripeResponse->json('error.message')
                ?? 'Could not create checkout session';

            return response()->json(['message' => $message], 422);
        }

        $data      = $stripeResponse->json();
        $sessionId = $data['id'] ?? null;

        $subscription->update(['stripe_session_id' => $sessionId]);

        return $this->ok([
            'checkout_url'    => $data['url'],
            'subscription_id' => $subscription->id,
            'session_id'      => $sessionId,
        ]);
    }

    // ─── POST /api/UserSubscription/confirm ──────────────────────────────────

    #[OA\Post(
        path: '/api/UserSubscription/confirm',
        summary: 'Confirm Stripe payment and activate subscription',
        description: 'Verifies the Stripe Checkout session, activates the subscription, records a payment transaction, and sets expires_at to 30 days from now.',
        operationId: 'confirmSubscription',
        tags: ['UserSubscription'],
        security: [['bearerAuth' => []]],
    )]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            required: ['session_id', 'subscription_id'],
            properties: [
                new OA\Property(property: 'session_id', type: 'string', example: 'cs_test_a1b2c3'),
                new OA\Property(property: 'subscription_id', type: 'integer', example: 1),
            ]
        )
    )]
    #[OA\Response(
        response: 200,
        description: 'Subscription activated',
        content: new OA\JsonContent(ref: '#/components/schemas/GetUserSubscriptionResponse200')
    )]
    #[OA\Response(response: 403, description: 'Session does not belong to this user')]
    #[OA\Response(response: 422, description: 'Payment not completed or invalid session')]
    public function confirm(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'session_id'      => ['required', 'string'],
            'subscription_id' => ['required', 'integer', 'exists:user_subscriptions,id'],
        ]);

        $apiKey = config('stripe.secret');
        if (! is_string($apiKey) || $apiKey === '') {
            return response()->json(['message' => 'Stripe not configured on server'], 503);
        }

        $user         = Auth::user();
        $subscription = UserSubscription::with(['plan'])->findOrFail($validated['subscription_id']);

        if ((int) $subscription->user_id !== (int) $user->id) {
            return response()->json(['message' => 'This subscription does not belong to your account'], 403);
        }

        if ($subscription->status === 'active') {
            return $this->ok($subscription->load(['plan', 'transactions']));
        }

        $stripeResponse = Http::withHeaders([
            'Authorization' => 'Bearer ' . $apiKey,
        ])->timeout(15)->get('https://api.stripe.com/v1/checkout/sessions/' . $validated['session_id']);

        if ($stripeResponse->failed()) {
            return response()->json(['message' => 'Invalid or expired checkout session'], 422);
        }

        $data = $stripeResponse->json();

        if (($data['payment_status'] ?? '') !== 'paid') {
            return response()->json(['message' => 'Payment not completed yet'], 422);
        }

        $meta = $data['metadata'] ?? [];
        if ((int) ($meta['user_id'] ?? 0) !== (int) $user->id) {
            return response()->json(['message' => 'Session metadata mismatch'], 403);
        }

        $amountMajor = round((float) ($data['amount_total'] ?? 0) / 100, 2);

        $subscription->update([
            'status'           => 'active',
            'stripe_session_id' => $validated['session_id'],
            'expires_at'       => now()->addDays(30),
        ]);

        SubscriptionTransaction::create([
            'user_subscription_id' => $subscription->id,
            'amount'               => $amountMajor,
            'type'                 => TransactionTypeEnum::PAYMENT->value,
            'stripe_session_id'    => $validated['session_id'],
        ]);

        return $this->ok($subscription->load(['plan', 'transactions']));
    }

    // ─── POST /api/UserSubscription/{id}/renew ───────────────────────────────

    #[OA\Post(
        path: '/api/UserSubscription/{id}/renew',
        summary: 'Renew a subscription via Stripe Checkout',
        description: 'Creates a new Stripe Checkout session to renew the subscription. After payment, call /confirm with the new session_id and the same subscription_id.',
        operationId: 'renewSubscription',
        tags: ['UserSubscription'],
        security: [['bearerAuth' => []]],
    )]
    #[OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            required: ['success_url', 'cancel_url'],
            properties: [
                new OA\Property(property: 'success_url', type: 'string', example: 'https://example.com/subscription/success'),
                new OA\Property(property: 'cancel_url', type: 'string', example: 'https://example.com/subscription'),
            ]
        )
    )]
    #[OA\Response(
        response: 200,
        description: 'Stripe Checkout URL returned',
        content: new OA\JsonContent(
            properties: [
                new OA\Property(property: 'success', type: 'boolean', example: true),
                new OA\Property(property: 'checkout_url', type: 'string'),
                new OA\Property(property: 'session_id', type: 'string'),
            ]
        )
    )]
    public function renew(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'success_url' => ['required', 'string', 'url'],
            'cancel_url'  => ['required', 'string', 'url'],
        ]);

        $apiKey = config('stripe.secret');
        if (! is_string($apiKey) || $apiKey === '') {
            return response()->json(['message' => 'Stripe not configured on server'], 503);
        }

        $user         = Auth::user();
        $subscription = UserSubscription::with('plan')->findOrFail($id);

        if ((int) $subscription->user_id !== (int) $user->id) {
            return response()->json(['message' => 'This subscription does not belong to your account'], 403);
        }

        if ($subscription->status === 'cancelled') {
            return response()->json(['message' => 'Cannot renew a cancelled subscription. Please subscribe to a new plan.'], 422);
        }

        $plan        = $subscription->plan;

        // ── Free plan renewal: extend immediately without Stripe ──────────────
        if ((float) $plan->price <= 0) {
            $base      = ($subscription->expires_at && $subscription->expires_at->isFuture())
                ? $subscription->expires_at
                : now();
            $subscription->update([
                'status'     => 'active',
                'expires_at' => $base->addDays(30),
            ]);

            SubscriptionTransaction::create([
                'user_subscription_id' => $subscription->id,
                'amount'               => 0,
                'type'                 => TransactionTypeEnum::RENEWAL->value,
            ]);

            return $this->ok([
                'checkout_url'    => null,
                'subscription_id' => $subscription->id,
                'session_id'      => null,
                'activated'       => true,
            ]);
        }

        $amountMinor = (int) round((float) $plan->price * 100);
        if ($amountMinor < self::STRIPE_MIN_PHP_AMOUNT_MINOR) {
            return response()->json([
                'message' => 'This plan amount is too low for Stripe Checkout. Please choose a plan worth at least PHP 50.00.',
            ], 422);
        }

        $successUrl  = rtrim($validated['success_url'], '/') . '?session_id={CHECKOUT_SESSION_ID}&subscription_id=' . $subscription->id . '&action=renew';

        $stripeResponse = Http::withHeaders([
            'Authorization' => 'Bearer ' . $apiKey,
        ])->timeout(15)->asForm()->post('https://api.stripe.com/v1/checkout/sessions', [
            'payment_method_types[0]'                              => 'card',
            'mode'                                                 => 'payment',
            'line_items[0][price_data][currency]'                  => 'php',
            'line_items[0][price_data][product_data][name]'        => $plan->name . ' Subscription Renewal',
            'line_items[0][price_data][product_data][description]' => $plan->description,
            'line_items[0][price_data][unit_amount]'               => $amountMinor,
            'line_items[0][quantity]'                              => 1,
            'metadata[subscription_id]'                            => $subscription->id,
            'metadata[plan_id]'                                    => $plan->id,
            'metadata[user_id]'                                    => $user->id,
            'metadata[action]'                                     => 'renew',
            'success_url'                                          => $successUrl,
            'cancel_url'                                           => $validated['cancel_url'],
        ]);

        if ($stripeResponse->failed()) {
            Log::error('UserSubscription renew: Stripe session creation failed.', [
                'body' => $stripeResponse->body(),
            ]);

            $message = $stripeResponse->json('error.message')
                ?? 'Could not create renewal checkout session';

            return response()->json(['message' => $message], 422);
        }

        $data      = $stripeResponse->json();
        $sessionId = $data['id'] ?? null;

        return $this->ok([
            'checkout_url'    => $data['url'],
            'subscription_id' => $subscription->id,
            'session_id'      => $sessionId,
        ]);
    }

    // ─── POST /api/UserSubscription/{id}/confirm-renewal ─────────────────────

    #[OA\Post(
        path: '/api/UserSubscription/{id}/confirm-renewal',
        summary: 'Confirm Stripe renewal payment',
        description: 'Verifies the renewal Stripe Checkout session, extends expires_at by 30 days, and records a RENEWAL transaction.',
        operationId: 'confirmSubscriptionRenewal',
        tags: ['UserSubscription'],
        security: [['bearerAuth' => []]],
    )]
    #[OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            required: ['session_id'],
            properties: [
                new OA\Property(property: 'session_id', type: 'string', example: 'cs_test_a1b2c3'),
            ]
        )
    )]
    #[OA\Response(
        response: 200,
        description: 'Subscription renewed',
        content: new OA\JsonContent(ref: '#/components/schemas/GetUserSubscriptionResponse200')
    )]
    public function confirmRenewal(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'session_id' => ['required', 'string'],
        ]);

        $apiKey = config('stripe.secret');
        if (! is_string($apiKey) || $apiKey === '') {
            return response()->json(['message' => 'Stripe not configured on server'], 503);
        }

        $user         = Auth::user();
        $subscription = UserSubscription::with(['plan'])->findOrFail($id);

        if ((int) $subscription->user_id !== (int) $user->id) {
            return response()->json(['message' => 'This subscription does not belong to your account'], 403);
        }

        // Guard against double-processing
        if (SubscriptionTransaction::where('stripe_session_id', $validated['session_id'])->exists()) {
            return $this->ok($subscription->load(['plan', 'transactions']));
        }

        $stripeResponse = Http::withHeaders([
            'Authorization' => 'Bearer ' . $apiKey,
        ])->timeout(15)->get('https://api.stripe.com/v1/checkout/sessions/' . $validated['session_id']);

        if ($stripeResponse->failed()) {
            return response()->json(['message' => 'Invalid or expired checkout session'], 422);
        }

        $data = $stripeResponse->json();

        if (($data['payment_status'] ?? '') !== 'paid') {
            return response()->json(['message' => 'Payment not completed yet'], 422);
        }

        $meta = $data['metadata'] ?? [];
        if ((int) ($meta['user_id'] ?? 0) !== (int) $user->id) {
            return response()->json(['message' => 'Session metadata mismatch'], 403);
        }

        $amountMajor = round((float) ($data['amount_total'] ?? 0) / 100, 2);

        // Extend from current expiry or now, whichever is later
        $base       = ($subscription->expires_at && $subscription->expires_at->isFuture())
            ? $subscription->expires_at
            : now();
        $newExpiry  = $base->addDays(30);

        $subscription->update([
            'status'           => 'active',
            'stripe_session_id' => $validated['session_id'],
            'expires_at'       => $newExpiry,
        ]);

        SubscriptionTransaction::create([
            'user_subscription_id' => $subscription->id,
            'amount'               => $amountMajor,
            'type'                 => TransactionTypeEnum::RENEWAL->value,
            'stripe_session_id'    => $validated['session_id'],
        ]);

        return $this->ok($subscription->load(['plan', 'transactions']));
    }

    // ─── POST /api/UserSubscription/{id}/cancel ──────────────────────────────

    #[OA\Post(
        path: '/api/UserSubscription/{id}/cancel',
        summary: 'Cancel a subscription',
        description: 'Marks the subscription as cancelled. It remains accessible until expires_at.',
        operationId: 'cancelSubscription',
        tags: ['UserSubscription'],
        security: [['bearerAuth' => []]],
    )]
    #[OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))]
    #[OA\Response(
        response: 200,
        description: 'Subscription cancelled',
        content: new OA\JsonContent(ref: '#/components/schemas/GetUserSubscriptionResponse200')
    )]
    #[OA\Response(response: 403, description: 'Not your subscription')]
    #[OA\Response(response: 422, description: 'Already cancelled')]
    public function cancel(int $id): JsonResponse
    {
        $user         = Auth::user();
        $subscription = UserSubscription::findOrFail($id);

        if ((int) $subscription->user_id !== (int) $user->id) {
            return response()->json(['message' => 'This subscription does not belong to your account'], 403);
        }

        if ($subscription->status === 'cancelled') {
            return response()->json(['message' => 'Subscription is already cancelled'], 422);
        }

        $subscription->update(['status' => 'cancelled']);

        return $this->ok($subscription->load(['plan', 'transactions']));
    }

    // ─── GET /api/UserSubscription/{id}/transactions ─────────────────────────

    #[OA\Get(
        path: '/api/UserSubscription/{id}/transactions',
        summary: 'List transactions for a subscription',
        description: 'Returns all payment/renewal/refund transactions for the given subscription.',
        operationId: 'getSubscriptionTransactions',
        tags: ['UserSubscription'],
        security: [['bearerAuth' => []]],
    )]
    #[OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))]
    #[OA\Response(
        response: 200,
        description: 'Transaction list',
        content: new OA\JsonContent(ref: '#/components/schemas/PaginatedSubscriptionTransactionResponse200')
    )]
    public function transactions(int $id): JsonResponse
    {
        $user         = Auth::user();
        $subscription = UserSubscription::findOrFail($id);

        if ((int) $subscription->user_id !== (int) $user->id) {
            return response()->json(['message' => 'This subscription does not belong to your account'], 403);
        }

        $transactions = SubscriptionTransaction::where('user_subscription_id', $id)
            ->orderByDesc('created_at')
            ->get();

        return $this->ok($transactions);
    }
}
