<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: "Plan",
    title: "Plan",
    type: "object",
    required: [
        "id",
        "name",
        "description",
        "price",
        "active",
    ],
    properties: [
        new OA\Property(property: "id", type: "integer", format: "int64"),
        new OA\Property(property: "name", type: "string"),
        new OA\Property(property: "description", type: "string"),
        new OA\Property(property: "price", type: "number", format: "float"),
        new OA\Property(property: "active", type: "boolean", example: true),
    ]
)]

#[OA\Schema(
    schema: "PaginatedPlan",
    title:"PaginatedPlan",
    type: "object",
    properties: [
        new OA\Property(property: "data", type: "array", items: new OA\Items(ref: "#/components/schemas/Plan")),
        new OA\Property(property: "current_page", type: "integer"),
        new OA\Property(property: "last_page", type: "integer"),
        new OA\Property(property: "per_page", type: "integer"),
        new OA\Property(property: "total", type: "integer"),
        new OA\Property(property: "from", type: "integer", nullable: true),
        new OA\Property(property: "to", type: "integer", nullable: true),
    ]
)]

#[OA\Schema(
    schema: "PaginatedPlanResponse200",
    type: "object",
    properties: [
        new OA\Property(property: "success", type: "boolean", example: true),
        new OA\Property(property: "data", ref: "#/components/schemas/PaginatedPlan")
    ]
)]

#[OA\Schema(
    schema: "GetPlanResponse200",
    type: "object",
    properties: [
        new OA\Property(property: "success", type: "boolean", example: true),
        new OA\Property(property: "data", ref: "#/components/schemas/Plan")
    ]
)]

#[OA\Schema(
    schema: "CreatePlanResponse200",
    type: "object",
    properties: [
        new OA\Property(property: "success", type: "boolean", example: true),
        new OA\Property(property: "data", ref: "#/components/schemas/Plan")
    ]
)]

#[OA\Schema(
    schema: "UpdatePlanResponse200",
    type: "object",
    properties: [
        new OA\Property(property: "success", type: "boolean", example: true),
        new OA\Property(property: "data", ref: "#/components/schemas/Plan")
    ]
)]

#[OA\Schema(
    schema: "DeletePlanResponse200",
    type: "object",
    properties: [
        new OA\Property(property: "success", type: "boolean", example: true)
    ]
)]

class Plan extends Model
{
    protected $table = 'plans';

    public $timestamps = false;

    protected $fillable = [
        'name',
        'description',
        'price',
        'active',
    ];

    // casts
    protected $casts = [
        'price' => 'decimal:2',
        'active' => 'boolean',
    ];
}
