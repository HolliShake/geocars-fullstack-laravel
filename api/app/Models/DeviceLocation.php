<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use OpenApi\Attributes as OA;

#[
    OA\Schema(
        schema: "DeviceLocation",
        title: "DeviceLocation",
        type: "object",
        required: ["latitude", "longitude", "device_id"],
        properties: [
            new OA\Property(property: "id", type: "integer", readOnly: true),
            new OA\Property(
                property: "latitude",
                type: "number",
                format: "float",
            ),
            new OA\Property(
                property: "longitude",
                type: "number",
                format: "float",
            ),
            new OA\Property(property: "device_id", type: "integer"),
            new OA\Property(
                property: "created_at",
                type: "string",
                format: "date-time",
                readOnly: true,
            ),
            new OA\Property(
                property: "updated_at",
                type: "string",
                format: "date-time",
                readOnly: true,
            ),
        ],
    ),
]
#[
    OA\Schema(
        schema: "PaginatedDeviceLocation",
        title: "PaginatedDeviceLocation",
        type: "object",
        properties: [
            new OA\Property(
                property: "data",
                type: "array",
                items: new OA\Items(ref: "#/components/schemas/DeviceLocation"),
            ),
            new OA\Property(property: "current_page", type: "integer"),
            new OA\Property(property: "last_page", type: "integer"),
            new OA\Property(property: "per_page", type: "integer"),
            new OA\Property(property: "total", type: "integer"),
            new OA\Property(property: "from", type: "integer", nullable: true),
            new OA\Property(property: "to", type: "integer", nullable: true),
        ],
    ),
]
#[
    OA\Schema(
        schema: "PaginatedDeviceLocationResponse200",
        type: "object",
        properties: [
            new OA\Property(
                property: "success",
                type: "boolean",
                example: true,
            ),
            new OA\Property(
                property: "data",
                ref: "#/components/schemas/PaginatedDeviceLocation",
            ),
        ],
    ),
]
#[
    OA\Schema(
        schema: "GetDeviceLocationResponse200",
        type: "object",
        properties: [
            new OA\Property(
                property: "success",
                type: "boolean",
                example: true,
            ),
            new OA\Property(
                property: "data",
                ref: "#/components/schemas/DeviceLocation",
            ),
        ],
    ),
]
#[
    OA\Schema(
        schema: "CreateDeviceLocationResponse200",
        type: "object",
        properties: [
            new OA\Property(
                property: "success",
                type: "boolean",
                example: true,
            ),
            new OA\Property(
                property: "data",
                ref: "#/components/schemas/DeviceLocation",
            ),
        ],
    ),
]
#[
    OA\Schema(
        schema: "UpdateDeviceLocationResponse200",
        type: "object",
        properties: [
            new OA\Property(
                property: "success",
                type: "boolean",
                example: true,
            ),
            new OA\Property(
                property: "data",
                ref: "#/components/schemas/DeviceLocation",
            ),
        ],
    ),
]
#[
    OA\Schema(
        schema: "DeleteDeviceLocationResponse200",
        type: "object",
        properties: [
            new OA\Property(
                property: "success",
                type: "boolean",
                example: true,
            ),
        ],
    ),
]
class DeviceLocation extends Model
{
    protected $table = "device_location";

    protected $fillable = ["latitude", "longitude", "device_id"];

    protected $casts = [
        "latitude" => "float",
        "longitude" => "float",
    ];

    public function device()
    {
        return $this->belongsTo(Device::class);
    }
}
