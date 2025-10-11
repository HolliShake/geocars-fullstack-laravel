<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: "UserSubscription",
    title: "UserSubscription",
    type: "object",
    required: [
        "id",
        "user_id",
        "plan_id",
    ],
    properties: [
        // Override fillables
        new OA\Property(property: "id", type: "integer", example: 1),
        new OA\Property(property: "user_id", type: "integer", example: 1),
        new OA\Property(property: "plan_id", type: "integer", example: 1),
        new OA\Property(property: "created_at", type: "string", format: "date-time", example: "2024-01-01T00:00:00Z"),
        new OA\Property(property: "updated_at", type: "string", format: "date-time", example: "2024-01-01T00:00:00Z"),
    ]
)]

#[OA\Schema(
    schema: "PaginatedUserSubscription",
    title: "PaginatedUserSubscription",
    type: "object",
    properties: [
        new OA\Property(property: "data", type: "array", items: new OA\Items(ref: "#/components/schemas/UserSubscription")),
        new OA\Property(property: "current_page", type: "integer"),
        new OA\Property(property: "last_page", type: "integer"),
        new OA\Property(property: "per_page", type: "integer"),
        new OA\Property(property: "total", type: "integer"),
        new OA\Property(property: "from", type: "integer", nullable: true),
        new OA\Property(property: "to", type: "integer", nullable: true),
    ]
)]

#[OA\Schema(
    schema: "PaginatedUserSubscriptionResponse200",
    type: "object",
    properties: [
        new OA\Property(property: "success", type: "boolean", example: true),
        new OA\Property(property: "data", ref: "#/components/schemas/PaginatedUserSubscription")
    ]
)]

#[OA\Schema(
    schema: "GetUserSubscriptionResponse200",
    type: "object",
    properties: [
        new OA\Property(property: "success", type: "boolean", example: true),
        new OA\Property(property: "data", ref: "#/components/schemas/UserSubscription")
    ]
)]

#[OA\Schema(
    schema: "CreateUserSubscriptionResponse200",
    type: "object",
    properties: [
        new OA\Property(property: "success", type: "boolean", example: true),
        new OA\Property(property: "data", ref: "#/components/schemas/UserSubscription")
    ]
)]

#[OA\Schema(
    schema: "UpdateUserSubscriptionResponse200",
    type: "object",
    properties: [
        new OA\Property(property: "success", type: "boolean", example: true),
        new OA\Property(property: "data", ref: "#/components/schemas/UserSubscription")
    ]
)]

#[OA\Schema(
    schema: "DeleteUserSubscriptionResponse200",
    type: "object",
    properties: [
        new OA\Property(property: "success", type: "boolean", example: true)
    ]
)]

class UserSubscription extends Model
{
    protected $table = 'user_subscriptions';

    public $timestamps = true;

    protected $fillable = [
        'user_id',
        'plan_id',
        'status'
    ];

    function plan() {
        return $this->belongsTo(Plan::class);
    }
}
