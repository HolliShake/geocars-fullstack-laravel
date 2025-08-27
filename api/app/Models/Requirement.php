<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: "Requirement",
    title: "Requirement",
    type: "object",
    required: [
        "name",
        "description",
        "is_required",
        "is_active",
        "role"
    ],
    properties: [
        new OA\Property(property: "id", type: "integer"),
        new OA\Property(property: "created_at", type: "string", format: "date-time"),
        new OA\Property(property: "updated_at", type: "string", format: "date-time"),
        new OA\Property(property: "name", type: "string"),
        new OA\Property(property: "description", type: "string"),
        new OA\Property(property: "is_required", type: "boolean"),
        new OA\Property(property: "is_active", type: "boolean"),
        new OA\Property(property: "role", type: "string"),
    ]
)]

#[OA\Schema(
    schema: "PaginatedRequirement",
    title:"PaginatedRequirement",
    type: "object",
    properties: [
        new OA\Property(property: "data", type: "array", items: new OA\Items(ref: "#/components/schemas/Requirement")),
        new OA\Property(property: "current_page", type: "integer"),
        new OA\Property(property: "last_page", type: "integer"),
        new OA\Property(property: "per_page", type: "integer"),
        new OA\Property(property: "total", type: "integer"),
        new OA\Property(property: "from", type: "integer", nullable: true),
        new OA\Property(property: "to", type: "integer", nullable: true),
    ]
)]

#[OA\Schema(
    schema: "PaginatedRequirementResponse200",
    type: "object",
    properties: [
        new OA\Property(property: "success", type: "boolean", example: true),
        new OA\Property(property: "data", ref: "#/components/schemas/PaginatedRequirement")
    ]
)]

#[OA\Schema(
    schema: "GetRequirementResponse200",
    type: "object",
    properties: [
        new OA\Property(property: "success", type: "boolean", example: true),
        new OA\Property(property: "data", ref: "#/components/schemas/Requirement")
    ]
)]

#[OA\Schema(
    schema: "CreateRequirementResponse200",
    type: "object",
    properties: [
        new OA\Property(property: "success", type: "boolean", example: true),
        new OA\Property(property: "data", ref: "#/components/schemas/Requirement")
    ]
)]

#[OA\Schema(
    schema: "UpdateRequirementResponse200",
    type: "object",
    properties: [
        new OA\Property(property: "success", type: "boolean", example: true),
        new OA\Property(property: "data", ref: "#/components/schemas/Requirement")
    ]
)]

#[OA\Schema(
    schema: "DeleteRequirementResponse200",
    type: "object",
    properties: [
        new OA\Property(property: "success", type: "boolean", example: true)
    ]
)]

class Requirement extends Model
{
    protected $table = 'requirements';

    protected $fillable = [
        'name',
        'description',
        'is_required',
        'is_active',
        'role'
    ];

    protected $casts = [
        'is_required' => 'boolean',
        'is_active' => 'boolean',
    ];
}
