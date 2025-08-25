<?php

namespace App\Models;

use App\Enum\RentalStatusEnum;
use Illuminate\Database\Eloquent\Model;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: "CarPosting",
    title: "CarPosting",
    type: "object",
    required: [
        "car_id",
        "company_id",
        "start_date",
        "end_date",
        "description",
        "price",
        "force_enabled",
    ],
    properties: [
        new OA\Property(property: "id", type: "integer", example: 1),
        new OA\Property(property: "car_id", type: "integer", example: 1),
        new OA\Property(property: "car", type: "object", ref: "#/components/schemas/Car"),
        new OA\Property(property: "company_id", type: "integer", example: 1),
        new OA\Property(property: "company", type: "object", ref: "#/components/schemas/UserCompany"),
        new OA\Property(property: "start_date", type: "string", format: "date-time", example: "2023-01-01T00:00:00Z"),
        new OA\Property(property: "end_date", type: "string", format: "date-time", example: "2023-01-31T23:59:59Z"),
        new OA\Property(property: "description", type: "string", example: "Luxury sedan available for rent"),
        new OA\Property(property: "price", type: "number", format: "float", example: 99.99),
        new OA\Property(property: "force_enabled", type: "boolean", example: false),
        new OA\Property(property: "created_at", type: "string", format: "date-time", nullable: true),
        new OA\Property(property: "updated_at", type: "string", format: "date-time", nullable: true),
        // Computed properties
        new OA\Property(property: "is_available", type: "boolean", example: true),
    ]
)]

#[OA\Schema(
    schema: "PaginatedCarPosting",
    title:"PaginatedCarPosting",
    type: "object",
    properties: [
        new OA\Property(property: "data", type: "array", items: new OA\Items(ref: "#/components/schemas/CarPosting")),
        new OA\Property(property: "current_page", type: "integer"),
        new OA\Property(property: "last_page", type: "integer"),
        new OA\Property(property: "per_page", type: "integer"),
        new OA\Property(property: "total", type: "integer"),
        new OA\Property(property: "from", type: "integer", nullable: true),
        new OA\Property(property: "to", type: "integer", nullable: true),
    ]
)]

#[OA\Schema(
    schema: "PaginatedCarPostingResponse200",
    type: "object",
    properties: [
        new OA\Property(property: "success", type: "boolean", example: true),
        new OA\Property(property: "data", ref: "#/components/schemas/PaginatedCarPosting")
    ]
)]

#[OA\Schema(
    schema: "GetCarPostingResponse200",
    type: "object",
    properties: [
        new OA\Property(property: "success", type: "boolean", example: true),
        new OA\Property(property: "data", ref: "#/components/schemas/CarPosting")
    ]
)]

#[OA\Schema(
    schema: "CreateCarPostingResponse200",
    type: "object",
    properties: [
        new OA\Property(property: "success", type: "boolean", example: true),
        new OA\Property(property: "data", ref: "#/components/schemas/CarPosting")
    ]
)]

#[OA\Schema(
    schema: "UpdateCarPostingResponse200",
    type: "object",
    properties: [
        new OA\Property(property: "success", type: "boolean", example: true),
        new OA\Property(property: "data", ref: "#/components/schemas/CarPosting")
    ]
)]

#[OA\Schema(
    schema: "DeleteCarPostingResponse200",
    type: "object",
    properties: [
        new OA\Property(property: "success", type: "boolean", example: true)
    ]
)]

class CarPosting extends Model
{
    protected $table = 'car_postings';

    protected $fillable = [
        'car_id',
        'company_id',
        'start_date',
        'end_date',
        'description',
        'price',
        'force_enabled',
    ];

    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
    ];

    protected $appends = ['is_available'];

    /**
     * Get the availability status of the car posting.
     *
     * @return bool
     */
    public function getIsAvailableAttribute()
    {
        // Check if the car posting is still active (end date is in the future)
        if ($this->end_date < now()) {
            return false;
        }

        // If force_enabled is true and there are no active rentals, the car is available
        if ($this->force_enabled) {
            return !$this->carRentals()
                ->whereIn('rental_status', [
                    RentalStatusEnum::PENDING->value,
                    RentalStatusEnum::CONFIRMED->value
                ])
                ->exists();
        }

        // Check if there are any pending or confirmed rentals
        return !$this->carRentals()
            ->whereIn('rental_status', [
                RentalStatusEnum::PENDING->value,
                RentalStatusEnum::CONFIRMED->value
            ])
            ->exists();
    }

    /**
     * Get the car that owns the car posting.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function car()
    {
        return $this->belongsTo(Car::class, 'car_id', 'id');
    }

    /**
     * Get the car rentals for the car posting.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function carRentals()
    {
        return $this->hasMany(CarRental::class, 'car_posting_id', 'id');
    }
}
