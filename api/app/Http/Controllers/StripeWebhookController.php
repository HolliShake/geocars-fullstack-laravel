<?php

namespace App\Http\Controllers;

use App\Enum\TransactionTypeEnum;
use App\Models\CarRental;
use App\Models\Transaction;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Stripe\Event;
use Stripe\Webhook;
use Throwable;

class StripeWebhookController extends Controller
{
    /**
     * After Stripe redirects back with ?session_id=, the client calls this so we can
     * retrieve the session with the secret key and insert Transaction (works without webhooks in dev).
     */
    public function confirmCheckoutSession(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'session_id' => ['required', 'string'],
        ]);

        $apiKey = config('stripe.secret');
        if (! is_string($apiKey) || $apiKey === '') {
            Log::warning('Stripe confirm: STRIPE_SECRET_KEY is not configured.');

            return response()->json(['message' => 'Stripe not configured on server'], 503);
        }

        $user = $request->user();
        if ($user === null) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $http = Http::withHeaders([
            'Authorization' => 'Bearer '.$apiKey,
        ])->timeout(15);

        $stripeResponse = $http->get(
            'https://api.stripe.com/v1/checkout/sessions/'.$validated['session_id']
        );

        if ($stripeResponse->failed()) {
            Log::notice('Stripe confirm: Stripe API error.', [
                'status' => $stripeResponse->status(),
                'body' => $stripeResponse->body(),
            ]);

            return response()->json(['message' => 'Invalid or expired checkout session'], 422);
        }

        $data = $stripeResponse->json();
        if (! is_array($data)) {
            return response()->json(['message' => 'Invalid Stripe response'], 422);
        }

        if (($data['payment_status'] ?? '') !== 'paid') {
            return response()->json(['message' => 'Payment not completed yet'], 422);
        }

        $meta = $data['metadata'] ?? [];
        if (! is_array($meta)) {
            $meta = [];
        }
        $rentalId = (int) ($meta['car_rental_id'] ?? 0);

        if ($rentalId < 1) {
            return response()->json(['message' => 'Session missing rental metadata'], 422);
        }

        $rental = CarRental::query()->find($rentalId);
        if ($rental === null) {
            return response()->json(['message' => 'Rental not found'], 422);
        }

        if ((int) $rental->user_id !== (int) $user->id) {
            return response()->json(['message' => 'This payment does not belong to your account'], 403);
        }

        $sessionStripeId = (string) ($data['id'] ?? '');
        if ($sessionStripeId === '') {
            return response()->json(['message' => 'Invalid session payload'], 422);
        }

        try {
            $this->recordPaymentTransaction(
                carRentalId: $rentalId,
                referenceNumber: $sessionStripeId,
                amountTotalMinorUnits: (int) ($data['amount_total'] ?? 0),
            );
        } catch (Throwable $e) {
            Log::error('Stripe confirm: failed to record transaction.', ['error' => $e->getMessage()]);

            return response()->json(['message' => 'Could not save transaction'], 500);
        }

        return response()->json([
            'success' => true,
            'message' => 'Transaction recorded',
        ]);
    }

    /**
     * Stripe → Laravel (verify signature). Register this URL in the Stripe Dashboard.
     */
    public function webhook(Request $request): JsonResponse
    {
        if (! class_exists(Webhook::class)) {
            Log::error('stripe/stripe-php is missing. Run composer install in the api directory.');

            return response()->json(['message' => 'Webhook handler unavailable'], 503);
        }

        $secret = config('stripe.webhook_secret');
        if (! is_string($secret) || $secret === '') {
            Log::warning('Stripe webhook: STRIPE_WEBHOOK_SECRET is not configured.');

            return response()->json(['message' => 'Webhook not configured'], 503);
        }

        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');

        try {
            $event = Webhook::constructEvent(
                $payload,
                $sigHeader ?? '',
                $secret
            );
        } catch (Throwable $e) {
            Log::notice('Stripe webhook signature verification failed.', ['error' => $e->getMessage()]);

            return response()->json(['message' => 'Invalid signature'], 400);
        }

        return $this->dispatchStripeEvent($event);
    }

    /**
     * Node /stripe service → Laravel after Stripe signature was verified upstream.
     */
    public function gatewayIngest(Request $request): JsonResponse
    {
        $expected = config('stripe.gateway_ingest_secret');
        $provided = (string) $request->header('X-Stripe-Gateway-Secret', '');

        if (! is_string($expected) || $expected === '' || ! hash_equals($expected, $provided)) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $data = $request->validate([
            'session_id' => ['required', 'string'],
            'car_rental_id' => ['required', 'integer', 'min:1'],
            'amount_total' => ['required', 'integer', 'min:0'],
            'currency' => ['nullable', 'string', 'size:3'],
        ]);

        try {
            $this->recordPaymentTransaction(
                carRentalId: $data['car_rental_id'],
                referenceNumber: $data['session_id'],
                amountTotalMinorUnits: $data['amount_total'],
            );
        } catch (Throwable $e) {
            Log::error('Stripe gateway ingest failed.', ['error' => $e->getMessage(), 'data' => $data]);

            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json(['received' => true]);
    }

    private function dispatchStripeEvent(Event $event): JsonResponse
    {
        if ($event->type === 'checkout.session.completed') {
            /** @var \Stripe\Checkout\Session $session */
            $session = $event->data->object;

            try {
                $meta = $session->metadata !== null
                    ? (json_decode(json_encode($session->metadata), true) ?: [])
                    : [];
                $rentalId = (int) ($meta['car_rental_id'] ?? 0);

                if ($rentalId < 1) {
                    Log::warning('Stripe checkout.session.completed missing car_rental_id metadata.', [
                        'session_id' => $session->id ?? null,
                    ]);

                    return response()->json(['received' => true, 'skipped' => 'no_car_rental_id']);
                }

                $this->recordPaymentTransaction(
                    carRentalId: $rentalId,
                    referenceNumber: $session->id,
                    amountTotalMinorUnits: (int) ($session->amount_total ?? 0),
                );
            } catch (Throwable $e) {
                Log::error('Stripe webhook handler failed.', [
                    'error' => $e->getMessage(),
                    'event_id' => $event->id,
                ]);

                return response()->json(['message' => 'Handler error'], 500);
            }
        }

        return response()->json(['received' => true]);
    }

    /**
     * @param  int  $amountTotalMinorUnits  e.g. cents / centavos (Stripe amount_total)
     */
    private function recordPaymentTransaction(
        int $carRentalId,
        string $referenceNumber,
        int $amountTotalMinorUnits,
    ): void {
        if ($referenceNumber === '') {
            throw new \InvalidArgumentException('Missing payment reference.');
        }

        if (CarRental::query()->whereKey($carRentalId)->doesntExist()) {
            throw new \InvalidArgumentException('Car rental not found.');
        }

        $amountMajor = round($amountTotalMinorUnits / 100, 2);

        try {
            Transaction::query()->firstOrCreate(
                ['reference_number' => $referenceNumber],
                [
                    'car_rental_id' => $carRentalId,
                    'amount' => $amountMajor,
                    'type' => TransactionTypeEnum::PAYMENT->value,
                ]
            );
        } catch (QueryException $e) {
            if (($e->errorInfo[1] ?? null) === 1062) {
                return;
            }
            throw $e;
        }
    }
}
