<?php

namespace App\Models;

use App\Enum\RentalStatusEnum;
use Illuminate\Database\Eloquent\Model;
use OpenApi\Attributes as OA;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

#[OA\Schema(
    schema: "Car",
    title: "Car",
    type: "object",
    required: [
        "user_company_id",
        "brand",
        "model",
        "plate_number",
        "color",
        "type",
        "fuel_type",
        "transmission",
    ],
    properties: [
        new OA\Property(property: "id", type: "integer"),
        new OA\Property(property: "user_company_id", type: "integer"),
        new OA\Property(property: "brand", type: "string"),
        new OA\Property(property: "model", type: "string"),
        new OA\Property(property: "plate_number", type: "string"),
        new OA\Property(property: "color", type: "string"),
        new OA\Property(property: "type", type: "string", enum: ["sedan", "hatchback", "suv", "mpv", "coupe", "convertible", "other"]),
        new OA\Property(property: "year", type: "string", nullable: true),
        new OA\Property(property: "fuel_type", type: "string", enum: ["petrol", "diesel", "electric", "hybrid", "other"]),
        new OA\Property(property: "transmission", type: "string", enum: ["manual", "automatic", "other"]),
        new OA\Property(property: "engine_capacity", type: "string", nullable: true),
        new OA\Property(property: "engine_power", type: "string", nullable: true),
        new OA\Property(property: "engine_torque", type: "string", nullable: true),
        new OA\Property(property: "engine_type", type: "string", nullable: true),
        new OA\Property(property: "created_at", type: "string", format: "date-time"),
        new OA\Property(property: "updated_at", type: "string", format: "date-time"),
        // Computed properties
        new OA\Property(property: "image_url", type: "string", example: "https://placehold.co/600x400?text=Toyota+Camry"),
        new OA\Property(property: "is_available", type: "boolean", example: true),
    ]
)]

#[OA\Schema(
    schema: "PaginatedCar",
    title:"PaginatedCar",
    type: "object",
    properties: [
        new OA\Property(property: "data", type: "array", items: new OA\Items(ref: "#/components/schemas/Car")),
        new OA\Property(property: "current_page", type: "integer"),
        new OA\Property(property: "last_page", type: "integer"),
        new OA\Property(property: "per_page", type: "integer"),
        new OA\Property(property: "total", type: "integer"),
        new OA\Property(property: "from", type: "integer", nullable: true),
        new OA\Property(property: "to", type: "integer", nullable: true),
    ]
)]

#[OA\Schema(
    schema: "PaginatedCarResponse200",
    type: "object",
    properties: [
        new OA\Property(property: "success", type: "boolean", example: true),
        new OA\Property(property: "data", ref: "#/components/schemas/PaginatedCar")
    ]
)]

#[OA\Schema(
    schema: "GetCarResponse200",
    type: "object",
    properties: [
        new OA\Property(property: "success", type: "boolean", example: true),
        new OA\Property(property: "data", ref: "#/components/schemas/Car")
    ]
)]

#[OA\Schema(
    schema: "CreateCarResponse200",
    type: "object",
    properties: [
        new OA\Property(property: "success", type: "boolean", example: true),
        new OA\Property(property: "data", ref: "#/components/schemas/Car")
    ]
)]

#[OA\Schema(
    schema: "UpdateCarResponse200",
    type: "object",
    properties: [
        new OA\Property(property: "success", type: "boolean", example: true),
        new OA\Property(property: "data", ref: "#/components/schemas/Car")
    ]
)]

#[OA\Schema(
    schema: "DeleteCarResponse200",
    type: "object",
    properties: [
        new OA\Property(property: "success", type: "boolean", example: true)
    ]
)]

class Car extends Model implements HasMedia
{
    use InteractsWithMedia;

    protected $table = 'cars';

    protected $fillable = [
        'user_company_id',
        'brand',
        'model',
        'plate_number',
        'color',
        'type',
        'year',
        'fuel_type',
        'transmission',
        'engine_capacity',
        'engine_power',
        'engine_torque',
        'engine_type',
    ];

    protected $appends = ['is_available', 'image_url'];

    /**
     * Register the media collections for the car.
     *
     * @return void
     */
    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('cars');
    }

    /**
     * Get the image url for the car.
     *
     * @return string
     */
    public function getImageUrlAttribute()
    {
        return $this->getFirstMediaUrl('cars') ?? 'https://placehold.co/600x400?text=Toyota+Camry';
    }

    /**
     * Get the availability status of the car.
     *
     * @return bool
     */
    public function getIsAvailableAttribute()
    {
        // If no postings exist, car is available
        if (!$this->carPostings()->exists()) {
            return true;
        }

        // Car is unavailable if it has active postings with pending/confirmed rentals
        if ($this->carPostings()->where('end_date', '>=', now())->exists() || $this->carPostings()->where('force_enabled', true)->exists()) {
            return false;
        }

        // Car is unavailable if it has active postings with pending/confirmed rentals
        return !$this->carPostings()
            ->where(function ($query) {
                $query->where('end_date', '>=', now())
                      ->orWhere('force_enabled', true);
            })
            ->whereHas('carRentals', function ($query) {
                $query->whereIn('rental_status', [
                    RentalStatusEnum::PENDING->value,
                    RentalStatusEnum::CONFIRMED->value
                ]);
            })
            ->exists();
    }

    /**
     * Get the user company that owns the car.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function userCompany()
    {
        return $this->belongsTo(UserCompany::class, 'user_company_id', 'id');
    }

    /**
     * Get the car postings for the car.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function carPostings()
    {
        return $this->hasMany(CarPosting::class, 'car_id', 'id');
    }
}
