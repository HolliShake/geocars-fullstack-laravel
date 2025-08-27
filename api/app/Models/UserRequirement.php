<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: "UserRequirement",
    title: "UserRequirement",
    type: "object",
    required: [
        "user_id",
        "requirement_id"
    ],
    properties: [
        new OA\Property(property: "id", type: "integer", example: 1),
        new OA\Property(property: "user_id", type: "integer", example: 1),
        new OA\Property(property: "requirement_id", type: "integer", example: 1),
        new OA\Property(property: "created_at", type: "string", format: "date-time", example: "2024-01-01T00:00:00Z"),
        new OA\Property(property: "updated_at", type: "string", format: "date-time", example: "2024-01-01T00:00:00Z"),
    ]
)]

#[OA\Schema(
    schema: "PaginatedUserRequirement",
    title:"PaginatedUserRequirement",
    type: "object",
    properties: [
        new OA\Property(property: "data", type: "array", items: new OA\Items(ref: "#/components/schemas/UserRequirement")),
        new OA\Property(property: "current_page", type: "integer"),
        new OA\Property(property: "last_page", type: "integer"),
        new OA\Property(property: "per_page", type: "integer"),
        new OA\Property(property: "total", type: "integer"),
        new OA\Property(property: "from", type: "integer", nullable: true),
        new OA\Property(property: "to", type: "integer", nullable: true),
    ]
)]

#[OA\Schema(
    schema: "PaginatedUserRequirementResponse200",
    type: "object",
    properties: [
        new OA\Property(property: "success", type: "boolean", example: true),
        new OA\Property(property: "data", ref: "#/components/schemas/PaginatedUserRequirement")
    ]
)]

#[OA\Schema(
    schema: "GetUserRequirementResponse200",
    type: "object",
    properties: [
        new OA\Property(property: "success", type: "boolean", example: true),
        new OA\Property(property: "data", ref: "#/components/schemas/UserRequirement")
    ]
)]

#[OA\Schema(
    schema: "CreateUserRequirementResponse200",
    type: "object",
    properties: [
        new OA\Property(property: "success", type: "boolean", example: true),
        new OA\Property(property: "data", ref: "#/components/schemas/UserRequirement")
    ]
)]

#[OA\Schema(
    schema: "UpdateUserRequirementResponse200",
    type: "object",
    properties: [
        new OA\Property(property: "success", type: "boolean", example: true),
        new OA\Property(property: "data", ref: "#/components/schemas/UserRequirement")
    ]
)]

#[OA\Schema(
    schema: "DeleteUserRequirementResponse200",
    type: "object",
    properties: [
        new OA\Property(property: "success", type: "boolean", example: true)
    ]
)]

class UserRequirement extends Model
{
    protected $table = 'user_requirements';

    protected $fillable = [
        'user_id',
        'requirement_id'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
