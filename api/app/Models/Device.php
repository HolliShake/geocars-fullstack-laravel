<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: "Device",
    title: "Device",
    type: "object",
    required: ["device_identifier", "car_rental_id"],
    properties: [
        new OA\Property(property: "id", type: "integer", readOnly: true),
        new OA\Property(property: "device_identifier", type: "string"),
        new OA\Property(property: "car_rental_id", type: "integer"),
        new OA\Property(property: "created_at", type: "string", format: "date-time", readOnly: true),
        new OA\Property(property: "updated_at", type: "string", format: "date-time", readOnly: true)
    ]
)]

#[OA\Schema(
    schema: "PaginatedDevice",
    title:"PaginatedDevice",
    type: "object",
    properties: [
        new OA\Property(property: "data", type: "array", items: new OA\Items(ref: "#/components/schemas/Device")),
        new OA\Property(property: "current_page", type: "integer"),
        new OA\Property(property: "last_page", type: "integer"),
        new OA\Property(property: "per_page", type: "integer"),
        new OA\Property(property: "total", type: "integer"),
        new OA\Property(property: "from", type: "integer", nullable: true),
        new OA\Property(property: "to", type: "integer", nullable: true),
    ]
)]

#[OA\Schema(
    schema: "PaginatedDeviceResponse200",
    type: "object",
    properties: [
        new OA\Property(property: "success", type: "boolean", example: true),
        new OA\Property(property: "data", ref: "#/components/schemas/PaginatedDevice")
    ]
)]

#[OA\Schema(
    schema: "GetDeviceResponse200",
    type: "object",
    properties: [
        new OA\Property(property: "success", type: "boolean", example: true),
        new OA\Property(property: "data", ref: "#/components/schemas/Device")
    ]
)]

#[OA\Schema(
    schema: "CreateDeviceResponse200",
    type: "object",
    properties: [
        new OA\Property(property: "success", type: "boolean", example: true),
        new OA\Property(property: "data", ref: "#/components/schemas/Device")
    ]
)]

#[OA\Schema(
    schema: "UpdateDeviceResponse200",
    type: "object",
    properties: [
        new OA\Property(property: "success", type: "boolean", example: true),
        new OA\Property(property: "data", ref: "#/components/schemas/Device")
    ]
)]

#[OA\Schema(
    schema: "DeleteDeviceResponse200",
    type: "object",
    properties: [
        new OA\Property(property: "success", type: "boolean", example: true)
    ]
)]

class Device extends Model
{
    protected $fillable = [
        'device_identifier',
        'car_rental_id',
    ];

    /**
     * Get the car rental that owns the device.
     */
    public function carRental()
    {
        return $this->belongsTo(CarRental::class);
    }
}
