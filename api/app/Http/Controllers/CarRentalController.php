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
        * process payout to renter account if the payment was online.
     */
    #[OA\Post(
        path: "/api/CarRental/{id}/finish",
        summary: "Finish a confirmed CarRental",
        tags: ["CarRental"],
        description: "Marks a confirmed rental as completed, records the return date as now, computes refundable amount / additional charges, and — when the payment method is online — computes net payout to the renter's active UserAccount (refund minus 10% platform fee). A REFUND transaction is recorded for the net payout amount.",
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
            $platformFeeAmount  = 0.0;
            $netPayoutAmount    = 0.0;

            // Resolve renter's default payout account
            $payoutAccount = UserAccount::where('user_id', $rental->user_id)
                ->where('is_default', true)
                ->first();

            // For online payments, transfer refundable amount to active account minus platform fee.
            if (
                $rental->payment_method === PaymentMethodEnum::ONLINE->value
                && $refundableAmount > 0
            ) {
                if (!$payoutAccount) {
                    return $this->badRequest('No active payout account found for this user.');
                }

                $platformFeeAmount = round($refundableAmount * 0.10, 2);
                $netPayoutAmount = round(max($refundableAmount - $platformFeeAmount, 0), 2);

                $refundReference = 'payout_' . $id . '_' . time();

                $refundTransaction = Transaction::firstOrCreate(
                    ['reference_number' => $refundReference],
                    [
                        'car_rental_id' => $rental->id,
                        'amount'        => $netPayoutAmount,
                        'type'          => TransactionTypeEnum::REFUND->value,
                    ]
                );
            }

            return $this->ok([
                'rental'             => $rental->load('carPosting.car', 'user', 'transactions'),
                'refundable_amount'  => $refundableAmount,
                'additional_charges' => $additionalCharges,
                'platform_fee_amount' => $platformFeeAmount,
                'net_payout_amount'   => $netPayoutAmount,
                'refund_transaction' => $refundTransaction,
                'payout_account'     => $payoutAccount,
            ]);
        } catch (ModelNotFoundException) {
            return $this->notFound('CarRental not found');
        } catch (\Exception $e) {
            Log::error('finishRental error: ' . $e->getMessage(), ['rental_id' => $id]);
            return $this->internalServerError($e->getMessage());
        }
    }

    #[OA\Get(
        path: "/api/CarRental/Debt/Pending",
        summary: "Get pending rental debts",
        tags: ["CarRental"],
        description: "Returns car rentals with unsettled cash debt. For role=user, results are limited to rentals whose company owner matches the authenticated user via car_rental.car_posting.car.user_company.user_id.",
        operationId: "getPendingCarRentalDebts",
    )]
    #[OA\Parameter(name: "search", in: "query", required: false, schema: new OA\Schema(type: "string"))]
    #[OA\Parameter(name: "page", in: "query", required: false, schema: new OA\Schema(type: "integer", default: 1))]
    #[OA\Parameter(name: "rows", in: "query", required: false, schema: new OA\Schema(type: "integer", default: 10))]
    #[OA\Response(response: 200, description: "Successful operation")]
    public function pendingDebt(Request $request)
    {
        try {
            $authUser = Auth::user();
            $search = trim((string) $request->query('search', ''));
            $page = max((int) $request->query('page', 1), 1);
            $rows = max((int) $request->query('rows', 10), 1);

            $query = CarRental::query()
                ->with(['user', 'carPosting.car.userCompany'])
                ->where('payment_method', PaymentMethodEnum::CASH->value)
                ->whereNotNull('cash_debt')
                ->where('cash_debt', '>', 0)
                ->where(function ($q) {
                    $q->whereNull('cash_debt_settled')
                        ->orWhere('cash_debt_settled', false);
                });

            if ($search !== '') {
                $query->whereHas('user', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            }

            if ($authUser->role === 'user') {
                $query->whereHas('carPosting.car.userCompany', function ($q) use ($authUser) {
                    $q->where('user_id', $authUser->id);
                });
            }

            return $this->ok($query->latest('id')->paginate($rows, ['*'], 'page', $page));
        } catch (\Exception $e) {
            return $this->internalServerError($e->getMessage());
        }
    }

    #[OA\Post(
        path: "/api/CarRental/{id}/collect-debt",
        summary: "Collect pending cash debt",
        tags: ["CarRental"],
        description: "Marks pending cash debt as settled by collecting from the renter's default UserAccount. Uses renter identity from car_rental.user_id. For role=user, authorization uses car_rental.car_posting.car.user_company.user_id.",
        operationId: "collectCarRentalDebt",
    )]
    #[OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "integer"))]
    #[OA\Response(response: 200, description: "Debt collected successfully")]
    #[OA\Response(response: 400, description: "Debt not collectible")]
    #[OA\Response(response: 403, description: "Forbidden")]
    #[OA\Response(response: 404, description: "CarRental not found")]
    public function collectDebt(int $id)
    {
        try {
            $authUser = Auth::user();

            /** @var CarRental $rental */
            $rental = CarRental::with(['user', 'carPosting.car.userCompany'])->findOrFail($id);

            if ($authUser->role === 'user') {
                $companyOwnerId = $rental->carPosting?->car?->userCompany?->user_id;
                if ((int) $companyOwnerId !== (int) $authUser->id) {
                    return $this->forbidden('You do not have permission to collect debt for this rental.');
                }
            }

            if ($rental->payment_method !== PaymentMethodEnum::CASH->value) {
                return $this->badRequest('Debt collection is only available for cash payments.');
            }

            $outstandingDebt = (float) ($rental->cash_debt ?? 0);
            if ($outstandingDebt <= 0 || (bool) $rental->cash_debt_settled) {
                return $this->badRequest('No pending debt to collect for this rental.');
            }

            $renterDefaultAccount = UserAccount::where('user_id', $rental->user_id)
                ->where('is_default', true)
                ->first();

            if (!$renterDefaultAccount) {
                return $this->badRequest('Renter has no default account configured for collection.');
            }

            $rental->forceFill([
                'cash_debt_settled' => true,
                'cash_debt' => 0,
            ])->save();

            $collectionTransaction = Transaction::create([
                'car_rental_id' => $rental->id,
                'amount' => $outstandingDebt,
                'type' => TransactionTypeEnum::PAYMENT->value,
                'reference_number' => 'collect_' . $rental->id . '_' . time(),
            ]);

            return $this->ok([
                'rental' => $rental->fresh(['user', 'carPosting.car.userCompany']),
                'collected_amount' => $outstandingDebt,
                'collected_from_account' => $renterDefaultAccount,
                'transaction' => $collectionTransaction,
            ]);
        } catch (ModelNotFoundException) {
            return $this->notFound('CarRental not found');
        } catch (\Exception $e) {
            Log::error('collectDebt error: ' . $e->getMessage(), ['rental_id' => $id]);
            return $this->internalServerError($e->getMessage());
        }
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
