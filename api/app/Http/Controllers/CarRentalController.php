<?php

namespace App\Http\Controllers;

use App\Enum\PaymentMethodEnum;
use App\Enum\RentalStatusEnum;
use App\Enum\TransactionTypeEnum;
use App\Models\CarRental;
use App\Models\Transaction;
use App\Models\UserAccount;
use App\Service\CarRentalService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use OpenApi\Attributes as OA;

class CarRentalController extends Controller
{
    public function __construct(protected CarRentalService $service) {
    }

    /**
     * Display a listing of the resource.
     */
    #[OA\Get(
        path: "/api/CarRental",
        summary: "Get paginated list of CarRental",
        tags: ["CarRental"],
        description: "Retrieve a paginated list of CarRental with optional search",
        operationId:"getCarRentalPaginated",
    )]
    #[OA\Parameter(
        name: "search",
        in: "query",
        description: "Search term",
        required: false,
        schema: new OA\Schema(type: "string")
    )]
    #[OA\Parameter(
        name: "page",
        in: "query",
        description: "Page number",
        required: false,
        schema: new OA\Schema(type: "integer", default: 0)
    )]
    #[OA\Parameter(
        name: "rows",
        in: "query",
        description: "Number of items per page",
        required: false,
        schema: new OA\Schema(type: "integer", default: 10)
    )]
    #[OA\Parameter(
        name: "company_id",
        in: "query",
        description: "Company ID",
        required: false,
        schema: new OA\Schema(type: "integer")
    )]
    #[OA\Response(
        response: 200,
        description: "Successful operation",
        content: new OA\JsonContent(ref: "#/components/schemas/PaginatedCarRentalResponse200")
    )]
    public function index(Request $request)
    {
        $srch = $request->query("search", '');
        $page = $request->query("page", 0);
        $rows = $request->query("rows", 10);
        $company_id = $request->query("company_id", null);

        $conditions = [
            "user.lastname" => ['like', "%{$srch}%"],
        ];

        if ($company_id) {
            $conditions["carPosting.car.user_company_id"] = ['=', $company_id];
        }

        return $this->ok($this->service->paginate($page, $rows, ['*'], ['user', 'carPosting.car'], $conditions));
    }

    /**
     * Display the specified resource.
     */
    #[OA\Get(
        path: "/api/CarRental/{id}",
        summary: "Get a specific CarRental",
        tags: ["CarRental"],
        description: "Retrieve a CarRental by its ID",
        operationId: "getCarRentalById",
    )]
    #[OA\Parameter(
        name: "id",
        in: "path",
        required: true,
        schema: new OA\Schema(type: "integer")
    )]
    #[OA\Response(
        response: 200,
        description: "Successful operation",
        content: new OA\JsonContent(ref: "#/components/schemas/GetCarRentalResponse200")
    )]
    #[OA\Response(
        response: 404,
        description: "CarRental not found"
    )]
    public function show($id)
    {
        try {
            return $this->ok($this->service->get($id, ['*'], ['user.requirements.uploads', 'user.requirements.requirement', 'carPosting.car']));
        } catch (ModelNotFoundException $e) {
            return $this->notFound('CarRental not found');
        }
    }

    #[OA\Get(
        path: "/api/CarRental/CheckSubmission/{id}",
        summary: "Check if user has submitted to a CarPosting",
        tags: ["CarPosting"],
        description: "Check if the authenticated user has already submitted to a specific CarPosting",
        operationId: "checkCarPostingSubmission",
    )]
    #[OA\Parameter(
        name: "id",
        in: "path",
        required: true,
        schema: new OA\Schema(type: "integer")
    )]
    #[OA\Response(
        response: 200,
        description: "Successful operation",
        content: new OA\JsonContent(
            properties: [
                new OA\Property(property: "status", type: "string", example: "success"),
                new OA\Property(
                    property: "data",
                    type: "object",
                    properties: [
                        new OA\Property(property: "submitted", type: "boolean")
                    ]
                )
            ]
        )
    )]
    #[OA\Response(
        response: 401,
        description: "User not authorized"
    )]
    #[OA\Response(
        response: 404,
        description: "CarPosting not found"
    )]
    public function checkSubmission($id)
    {
        try {
            $user = Auth::user();
            $submitted = $this->service->checkSubmission($user->id, $id);
            return $this->ok(['submitted' => $submitted]);
        } catch (ModelNotFoundException $e) {
            return $this->notFound('CarPosting not found');
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    #[OA\Post(
        path: "/api/CarRental",
        summary: "Create a new CarRental",
        tags: ["CarRental"],
        description:" Create a new CarRental with the provided details",
        operationId: "createCarRental",
    )]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(ref: "#/components/schemas/CarRental")
    )]
    #[OA\Response(
        response: 200,
        description: "CarRental created successfully",
        content: new OA\JsonContent(ref: "#/components/schemas/CreateCarRentalResponse200")
    )]
    #[OA\Response(
        response: 422,
        description: "Validation error",
        content: new OA\JsonContent(ref: "#/components/schemas/ValidationErrorResponse")
    )]
    #[OA\Response(
        response: 500,
        description: "Internal server error",
        content: new OA\JsonContent(ref: "#/components/schemas/InternalServerErrorResponse")
    )]
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'car_posting_id'    => 'required|integer|exists:car_postings,id',
                'user_id'           => 'exclude_if:user_id,0|integer|exists:users,id',
                'days'              => 'required|integer|min:1',
                'deposit'           => 'required|numeric|min:0',
                'start_date'        => 'required|date|after_or_equal:today',
                'return_date'       => 'sometimes|nullable|date|after:start_date',
                'rental_status'     => 'sometimes|in:' . implode(',', array_column(RentalStatusEnum::cases(), 'value')),
                'payment_method'    => 'sometimes|string',
                'payment_reference' => 'nullable|string|max:255',
            ]);

            if ($validator->fails()) {
                return $this->validationError($validator->errors());
            }

            $validated = (array)[
                ...$validator->validated(),
                'user_id' => ($request->input('user_id') != 0)
                    ? $request->input('user_id')
                    : Auth::id(),
            ];

            error_log(json_encode($validated));

            return $this->ok($this->service->create($validated));
        } catch (\Exception $e) {
            return $this->internalServerError($e->getMessage());
        }
    }

    /**
     * Update the specified resource in storage.
     */
    #[OA\Put(
        path: "/api/CarRental/{id}",
        summary: "Update a CarRental",
        tags: ["CarRental"],
        description: "Update an existing CarRental with the provided details",
        operationId: "updateCarRental",
    )]
    #[OA\Parameter(
        name: "id",
        in: "path",
        required: true,
        schema: new OA\Schema(type: "integer"),
    )]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(ref: "#/components/schemas/CarRental")
    )]
    #[OA\Response(
        response: 200,
        description: "CarRental updated successfully",
        content: new OA\JsonContent(ref: "#/components/schemas/UpdateCarRentalResponse200")
    )]
    #[OA\Response(
        response: 404,
        description: "CarRental not found"
    )]
    #[OA\Response(
        response: 422,
        description: "Validation error",
        content: new OA\JsonContent(ref: "#/components/schemas/ValidationErrorResponse")
    )]
    #[OA\Response(
        response: 500,
        description: "Internal server error",
        content: new OA\JsonContent(ref: "#/components/schemas/InternalServerErrorResponse")
    )]
    public function update(Request $request, $id)
    {
        try {
            $validator = Validator::make($request->all(), [
                'car_posting_id'    => 'required|integer|exists:car_postings,id',
                'user_id'           => 'required|integer|exists:users,id',
                'days'              => 'required|integer|min:1',
                'deposit'           => 'required|numeric|min:0',
                // Do not validate day
                // 'start_date'        => 'required|date|after_or_equal:today',
                // 'return_date'       => 'required|date|after:start_date',
                'rental_status'     => 'sometimes|in:' . implode(',', array_column(RentalStatusEnum::cases(), 'value')),
                'payment_method'      => 'sometimes|string',
                'payment_reference'   => 'nullable|string|max:255',
                'cash_debt_settled'   => 'sometimes|boolean',
            ]);

            if ($validator->fails()) {
                return $this->validationError($validator->errors());
            }

            $validated = $validator->validated();

            // When confirming a cash-payment rental, record the full amount as debt.
            if (
                isset($validated['rental_status'])
                && $validated['rental_status'] === RentalStatusEnum::CONFIRMED->value
            ) {
                $existing = CarRental::with('carPosting')->findOrFail($id);
                $paymentMethod = $validated['payment_method'] ?? $existing->payment_method;
                if ($paymentMethod === PaymentMethodEnum::CASH->value) {
                    $days          = $validated['days'] ?? $existing->days;
                    $deposit       = $validated['deposit'] ?? $existing->deposit;
                    $pricePerDay   = (float) ($existing->carPosting?->price ?? 0);
                    $validated['cash_debt'] = ($days * $pricePerDay) + (float) $deposit;
                }
            }

            return $this->ok($this->service->update($id, $validated));
        } catch (ModelNotFoundException $e) {
            return $this->notFound('CarRental not found');
        } catch (\Exception $e) {
            return $this->internalServerError($e->getMessage());
        }
    }

    /**
     * Finish (complete) a confirmed car rental, set return date, and
     * process a Stripe refund + UserAccount payout if the payment was online.
     */
    #[OA\Post(
        path: "/api/CarRental/{id}/finish",
        summary: "Finish a confirmed CarRental",
        tags: ["CarRental"],
        description: "Marks a confirmed rental as completed, records the return date as now, computes refundable amount / additional charges, and — when the payment method is online — issues a Stripe refund for the refundable amount back to the original payment source, then records it as a REFUND transaction. The renter's default UserAccount (bank / e-wallet) is returned in the response so the caller knows where any manual payout should be sent.",
        operationId: "finishCarRental",
    )]
    #[OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "integer"))]
    #[OA\Response(
        response: 200,
        description: "Rental finished successfully",
        content: new OA\JsonContent(ref: "#/components/schemas/FinishCarRentalResponse200"),
    )]
    #[OA\Response(response: 400, description: "Rental is not in confirmed status")]
    #[OA\Response(response: 404, description: "CarRental not found")]
    #[OA\Response(
        response: 500,
        description: "Internal server error",
        content: new OA\JsonContent(ref: "#/components/schemas/InternalServerErrorResponse"),
    )]
    public function finishRental(int $id)
    {
        try {
            /** @var CarRental $rental */
            $rental = CarRental::with([
                'carPosting.car',
                'user.userAccounts',
                'transactions',
            ])->findOrFail($id);

            if ($rental->rental_status !== RentalStatusEnum::CONFIRMED->value) {
                return $this->badRequest(
                    'Only confirmed rentals can be finished. Current status: ' . $rental->rental_status
                );
            }

            // Mark as completed and set return date
            $updates = [
                'rental_status' => RentalStatusEnum::COMPLETED->value,
                'return_date'   => now(),
            ];

            // For cash payments, finalise the debt (original debt + additional charges).
            if ($rental->payment_method === PaymentMethodEnum::CASH->value) {
                $additionalChargesPreview = (float) $rental->additional_charges;
                $updates['cash_debt'] = ((float) ($rental->cash_debt ?? 0)) + $additionalChargesPreview;
            }

            $rental->forceFill($updates)->save();

            $rental->refresh();

            $refundableAmount   = (float) $rental->refundable_amount;
            $additionalCharges  = (float) $rental->additional_charges;
            $refundTransaction  = null;
            $stripeRefundId     = null;

            // Stripe refund for online payments when there is a refundable amount
            if (
                $rental->payment_method === PaymentMethodEnum::ONLINE->value
                && $refundableAmount > 0
            ) {
                // Find the original payment transaction (reference_number = Stripe session id)
                /** @var Transaction|null $paymentTx */
                $paymentTx = $rental->transactions()
                    ->where('type', TransactionTypeEnum::PAYMENT->value)
                    ->latest()
                    ->first();

                if ($paymentTx && $paymentTx->reference_number) {
                    $stripeRefundId = $this->issueStripeRefund(
                        sessionId:        $paymentTx->reference_number,
                        refundAmountMajor: $refundableAmount,
                    );
                }

                // Record the refund transaction regardless (even if Stripe isn't configured)
                $refundReference = $stripeRefundId ?? ('refund_manual_' . $id . '_' . time());

                $refundTransaction = Transaction::firstOrCreate(
                    ['reference_number' => $refundReference],
                    [
                        'car_rental_id' => $rental->id,
                        'amount'        => $refundableAmount,
                        'type'          => TransactionTypeEnum::REFUND->value,
                    ]
                );
            }

            // Resolve renter's default payout account
            $payoutAccount = UserAccount::where('user_id', $rental->user_id)
                ->where('is_default', true)
                ->first();

            if (!$payoutAccount) {
                $payoutAccount = UserAccount::where('user_id', $rental->user_id)->first();
            }

            return $this->ok([
                'rental'             => $rental->load('carPosting.car', 'user', 'transactions'),
                'refundable_amount'  => $refundableAmount,
                'additional_charges' => $additionalCharges,
                'refund_transaction' => $refundTransaction,
                'stripe_refund_id'   => $stripeRefundId,
                'payout_account'     => $payoutAccount,
            ]);
        } catch (ModelNotFoundException) {
            return $this->notFound('CarRental not found');
        } catch (\Exception $e) {
            Log::error('finishRental error: ' . $e->getMessage(), ['rental_id' => $id]);
            return $this->internalServerError($e->getMessage());
        }
    }

    /**
     * Retrieve the payment_intent from a Stripe checkout session, then create a refund.
     * Returns the Stripe refund id on success, null if Stripe is not configured or unavailable.
     */
    private function issueStripeRefund(string $sessionId, float $refundAmountMajor): ?string
    {
        $apiKey = config('stripe.secret');
        if (!is_string($apiKey) || $apiKey === '') {
            Log::warning('finishRental: STRIPE_SECRET_KEY is not configured — skipping Stripe refund.');
            return null;
        }

        $http = Http::withHeaders(['Authorization' => 'Bearer ' . $apiKey])->timeout(15);

        // 1. Retrieve checkout session to get payment_intent
        $sessionResponse = $http->get("https://api.stripe.com/v1/checkout/sessions/{$sessionId}");
        if ($sessionResponse->failed()) {
            Log::warning('finishRental: could not retrieve Stripe session.', [
                'session_id' => $sessionId,
                'status'     => $sessionResponse->status(),
            ]);
            return null;
        }

        $sessionData    = $sessionResponse->json();
        $paymentIntent  = $sessionData['payment_intent'] ?? null;

        if (!$paymentIntent) {
            Log::warning('finishRental: Stripe session has no payment_intent.', ['session_id' => $sessionId]);
            return null;
        }

        // 2. Create refund (amount in minor units)
        $refundResponse = $http->asForm()->post('https://api.stripe.com/v1/refunds', [
            'payment_intent' => $paymentIntent,
            'amount'         => (int) round($refundAmountMajor * 100),
        ]);

        if ($refundResponse->failed()) {
            Log::warning('finishRental: Stripe refund creation failed.', [
                'payment_intent' => $paymentIntent,
                'body'           => $refundResponse->body(),
            ]);
            return null;
        }

        return $refundResponse->json()['id'] ?? null;
    }

    /**
     * Remove the specified resource from storage.
     */
    #[OA\Delete(
        path: "/api/CarRental/{id}",
        summary: "Delete a CarRental",
        tags: ["CarRental"],
        description: "Delete a CarRental by its ID",
        operationId: "deleteCarRental",
    )]
    #[OA\Parameter(
        name: "id",
        in: "path",
        required: true,
        schema: new OA\Schema(type: "integer")
    )]
    #[OA\Response(
        response: 204,
        description: "CarRental deleted successfully",
        content: new OA\JsonContent(ref: "#/components/schemas/DeleteCarRentalResponse200")
    )]
    #[OA\Response(
        response: 404,
        description: "CarRental not found"
    )]
    #[OA\Response(
        response: 500,
        description:" Internal server error",
        content: new OA\JsonContent(ref: "#/components/schemas/InternalServerErrorResponse")
    )]
    public function destroy(string $id)
    {
        try {
            $this->service->delete($id);
            return $this->noContent();
        } catch (ModelNotFoundException $e) {
            return $this->notFound('CarRental not found');
        } catch (\Exception $e) {
            return $this->internalServerError($e->getMessage());
        }
    }
}
