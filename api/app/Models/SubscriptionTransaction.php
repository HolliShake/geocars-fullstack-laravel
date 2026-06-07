<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: "SubscriptionTransaction",
    title: "SubscriptionTransaction",
    type: "object",
    required: ["id", "user_id", "plan_id", "amount", "status", "created_at", "updated_at"],
    properties: [
        new OA\Property(property: "id", type: "integer", example: 1),
        new OA\Property(property: "user_id", type: "integer", example: 1),
        new OA\Property(property: "plan_id", type: "integer", example: 1),
        new OA\Property(property: "amount", type: "number", format: "float", example: 50.0),
        new OA\Property(property: "status", type: "string", example: "active"),
        new OA\Property(property: "created_at", type: "string", format: "date-time", example: "2024-01-01T00:00:00Z"),
        new OA\Property(property: "updated_at", type: "string", format: "date-time", example: "2024-01-01T00:00:00Z"),
    ]
)]

#[OA\Schema(
    schema: "PaginatedSubscriptionTransaction",
    title:"PaginatedSubscriptionTransaction",
    type: "object",
    properties: [
        new OA\Property(property: "data", type: "array", items: new OA\Items(ref: "#/components/schemas/SubscriptionTransaction")),
        new OA\Property(property: "current_page", type: "integer"),
        new OA\Property(property: "last_page", type: "integer"),
        new OA\Property(property: "per_page", type: "integer"),
        new OA\Property(property: "total", type: "integer"),
        new OA\Property(property: "from", type: "integer", nullable: true),
        new OA\Property(property: "to", type: "integer", nullable: true),
    ]
)]

#[OA\Schema(
    schema: "PaginatedSubscriptionTransactionResponse200",
    type: "object",
    properties: [
        new OA\Property(property: "success", type: "boolean", example: true),
        new OA\Property(property: "data", ref: "#/components/schemas/PaginatedSubscriptionTransaction")
    ]
)]

#[OA\Schema(
    schema: "GetSubscriptionTransactionResponse200",
    type: "object",
    properties: [
        new OA\Property(property: "success", type: "boolean", example: true),
        new OA\Property(property: "data", ref: "#/components/schemas/SubscriptionTransaction")
    ]
)]

#[OA\Schema(
    schema: "CreateSubscriptionTransactionResponse200",
    type: "object",
    properties: [
        new OA\Property(property: "success", type: "boolean", example: true),
        new OA\Property(property: "data", ref: "#/components/schemas/SubscriptionTransaction")
    ]
)]

#[OA\Schema(
    schema: "UpdateSubscriptionTransactionResponse200",
    type: "object",
    properties: [
        new OA\Property(property: "success", type: "boolean", example: true),
        new OA\Property(property: "data", ref: "#/components/schemas/SubscriptionTransaction")
    ]
)]

#[OA\Schema(
    schema: "DeleteSubscriptionTransactionResponse200",
    type: "object",
    properties: [
        new OA\Property(property: "success", type: "boolean", example: true)
    ]
)]

class SubscriptionTransaction extends Model
{
    protected $table = 'subscription_transactions';

    public $timestamps = true;

    protected $fillable = [
        'user_subscription_id',
        'amount',
        'type',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'type'   => TransactionTypeEnum::class,
    ];

    public function userSubscription(): BelongsTo
    {
        return $this->belongsTo(UserSubscription::class);
    }
}