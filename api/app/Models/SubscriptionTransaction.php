<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: "SubscriptionTransaction",
    title: "SubscriptionTransaction",
    type: "object",
    required: [
        // Override required
    ],
    properties: [
        // Override fillables
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
    //
}
