<?php

namespace App\Models;

use App\Enum\PaymentMethodEnum;
use App\Enum\RentalStatusEnum;
use Illuminate\Database\Eloquent\Model;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: "CarRental",
    title: "CarRental",
    type: "object",
    required: [
        "car_posting_id",
        "user_id",
        "days",
        "deposit",
        "start_date",
        "return_date",
        "rental_status",
        "payment_method",
        "payment_reference",
    ],
    properties: [
        new OA\Property(property: "id", type: "integer", example: 1),
        new OA\Property(property: "car_posting_id", type: "integer", example: 1),
        new OA\Property(property: "car_posting", type: "object", ref: "#/components/schemas/CarPosting"),
        new OA\Property(property: "user_id", type: "integer", example: 1),
        new OA\Property(property: "user", type: "object", ref: "#/components/schemas/User"),
        new OA\Property(property: "days", type: "integer", example: 3),
        new OA\Property(property: "deposit", type: "number", format: "float", example: 500.00),
        new OA\Property(property: "start_date", type: "string", format: "date-time", example: "2023-09-01T10:00:00Z"),
        new OA\Property(property: "return_date", type: "string", format: "date-time", example: "2023-09-04T10:00:00Z", nullable: true),
        new OA\Property(property: "rental_status", type: "string", enum: ["pending", "confirmed", "cancelled", "completed", "rejected"], example: "pending"),
        new OA\Property(property: "payment_method", type: "string", enum: ["cash", "online"], example: "cash", nullable: true),
        new OA\Property(property: "payment_reference", type: "string", nullable: true, example: "TXN123456"),
        new OA\Property(property: "cash_debt", type: "number", format: "float", nullable: true, example: 1500.00, description: "Outstanding cash owed by the renter. Set when confirmed with cash payment; null for online or unsettled."),
        new OA\Property(property: "cash_debt_settled", type: "boolean", example: false, description: "Whether the cash debt has been collected."),
        new OA\Property(property: "created_at", type: "string", format: "date-time", example: "2023-01-01T00:00:00Z"),
        new OA\Property(property: "updated_at", type: "string", format: "date-time", example: "2023-01-01T00:00:00Z"),
    ]
)]

#[OA\Schema(
    schema: "PaginatedCarRental",
    title:"PaginatedCarRental",
    type: "object",
    properties: [
        new OA\Property(property: "data", type: "array", items: new OA\Items(ref: "#/components/schemas/CarRental")),
        new OA\Property(property: "current_page", type: "integer"),
        new OA\Property(property: "last_page", type: "integer"),
        new OA\Property(property: "per_page", type: "integer"),
        new OA\Property(property: "total", type: "integer"),
        new OA\Property(property: "from", type: "integer", nullable: true),
        new OA\Property(property: "to", type: "integer", nullable: true),
    ]
)]

#[OA\Schema(
    schema: "PaginatedCarRentalResponse200",
    type: "object",
    properties: [
        new OA\Property(property: "success", type: "boolean", example: true),
        new OA\Property(property: "data", ref: "#/components/schemas/PaginatedCarRental")
    ]
)]

#[OA\Schema(
    schema: "GetCarRentalResponse200",
    type: "object",
    properties: [
        new OA\Property(property: "success", type: "boolean", example: true),
        new OA\Property(property: "data", ref: "#/components/schemas/CarRental")
    ]
)]

#[OA\Schema(
    schema: "CreateCarRentalResponse200",
    type: "object",
    properties: [
        new OA\Property(property: "success", type: "boolean", example: true),
        new OA\Property(property: "data", ref: "#/components/schemas/CarRental")
    ]
)]

#[OA\Schema(
    schema: "UpdateCarRentalResponse200",
    type: "object",
    properties: [
        new OA\Property(property: "success", type: "boolean", example: true),
        new OA\Property(property: "data", ref: "#/components/schemas/CarRental")
    ]
)]

#[OA\Schema(
    schema: "DeleteCarRentalResponse200",
    type: "object",
    properties: [
        new OA\Property(property: "success", type: "boolean", example: true)
    ]
)]

#[OA\Schema(
    schema: "FinishCarRentalResponse200",
    type: "object",
    properties: [
        new OA\Property(property: "success", type: "boolean", example: true),
        new OA\Property(
            property: "data",
            type: "object",
            properties: [
                new OA\Property(property: "rental", ref: "#/components/schemas/CarRental"),
                new OA\Property(property: "refundable_amount", type: "number", format: "float", example: 500.00),
                new OA\Property(property: "additional_charges", type: "number", format: "float", example: 0.00),
                new OA\Property(property: "refund_transaction", nullable: true, ref: "#/components/schemas/Transaction"),
                new OA\Property(property: "stripe_refund_id", type: "string", nullable: true, example: "re_3Pq..."),
                new OA\Property(property: "payout_account", nullable: true, ref: "#/components/schemas/UserAccount"),
            ]
        ),
    ]
)]

class CarRental extends Model
{
    protected $table = 'car_rentals';

    protected $fillable = [
        'car_posting_id',
        'user_id',
        'days',
        'deposit',
        'start_date',
        // 'return_date',
        // 'rental_status',
        // 'payment_method',
        // 'payment_reference',
        // 'cash_debt',
        // 'cash_debt_settled',
    ];

    protected $casts = [
        'start_date'        => 'datetime',
        'return_date'       => 'datetime',
        'cash_debt'         => 'decimal:2',
        'cash_debt_settled' => 'boolean',
    ];

    protected $appends = ['refundable_amount', 'additional_charges'];

    /**
     * Get the refundable amount for the car rental.
     *
     * @return float
     */
    public function getRefundableAmountAttribute()
    {
        $carPricePerDay = $this->carPosting->price;
        $deposit = $this->deposit;
        $scheduledEndDate = $this->start_date->copy()->addDays($this->days);

        // If rental is completed
        if ($this->rental_status === RentalStatusEnum::COMPLETED->value) {
            // If the car was returned earlier than scheduled
            if ($this->return_date < $scheduledEndDate) {
                // Calculate unused days
                $unusedDays = $scheduledEndDate->diffInDays($this->return_date);
                // Refund for unused days plus deposit
                $refundAmount = ($unusedDays * $carPricePerDay) + $deposit;
                return $refundAmount;
            }

            // If returned on time, refund only the deposit
            if ($this->return_date->isSameDay($scheduledEndDate)) {
                return $deposit;
            }

            // If returned late, no refund
            return 0;
        }

        // If rental is cancelled, refund full amount
        if ($this->rental_status === RentalStatusEnum::CANCELLED->value) {
            return $deposit + ($this->days * $carPricePerDay);
        }

        // For pending or confirmed rentals, no refund processed yet
        return 0;
    }

    /**
     * Get the additional charges for the car rental.
     *
     * @return float
     */
    public function getAdditionalChargesAttribute()
    {
        // If rental is not completed, no additional charges
        if ($this->rental_status !== RentalStatusEnum::COMPLETED->value) {
            return 0;
        }

        $carPricePerDay = $this->carPosting->price;
        $scheduledEndDate = $this->start_date->copy()->addDays($this->days);
        $additionalCharges = 0;

        // Calculate late return charges
        if ($this->return_date > $scheduledEndDate) {
            // Calculate extra days
            $extraDays = $scheduledEndDate->diffInDays($this->return_date);
            // Apply 1.5x daily rate for late returns
            $additionalCharges += $extraDays * ($carPricePerDay * 1.5);
        }

        return $additionalCharges;
    }

    /**
     * Get the car posting that owns the car rental.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function carPosting()
    {
        return $this->belongsTo(CarPosting::class, 'car_posting_id', 'id');
    }

    /**
     * Get the user that owns the car rental.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function user() // The user who is renting the car
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    /**
     * Get the transactions for the car rental.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function transactions()
    {
        return $this->hasMany(Transaction::class, 'car_rental_id', 'id');
    }
}
