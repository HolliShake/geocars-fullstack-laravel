<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: "Transaction",
    title: "Transaction",
    type: "object",
    required: ["id", "user_id", "amount", "status", "created_at", "updated_at"],
    properties: [
        new OA\Property(property: "id", type: "integer", example: 1),
        new OA\Property(property: "user_id", type: "integer", example: 1),
        new OA\Property(property: "amount", type: "number", format: "float", example: 100.0),
        new OA\Property(property: "status", type: "string", example: "completed"),
        new OA\Property(property: "created_at", type: "string", format: "date-time", example: "2024-01-01T00:00:00Z"),
        new OA\Property(property: "updated_at", type: "string", format: "date-time", example: "2024-01-01T00:00:00Z"),
    ]
)]

#[OA\Schema(
    schema: "PaginatedTransaction",
    title:"PaginatedTransaction",
    type: "object",
    properties: [
        new OA\Property(property: "data", type: "array", items: new OA\Items(ref: "#/components/schemas/Transaction")),
        new OA\Property(property: "current_page", type: "integer"),
        new OA\Property(property: "last_page", type: "integer"),
        new OA\Property(property: "per_page", type: "integer"),
        new OA\Property(property: "total", type: "integer"),
        new OA\Property(property: "from", type: "integer", nullable: true),
        new OA\Property(property: "to", type: "integer", nullable: true),
    ]
)]

#[OA\Schema(
    schema: "PaginatedTransactionResponse200",
    type: "object",
    properties: [
        new OA\Property(property: "success", type: "boolean", example: true),
        new OA\Property(property: "data", ref: "#/components/schemas/PaginatedTransaction")
    ]
)]

#[OA\Schema(
    schema: "GetTransactionResponse200",
    type: "object",
    properties: [
        new OA\Property(property: "success", type: "boolean", example: true),
        new OA\Property(property: "data", ref: "#/components/schemas/Transaction")
    ]
)]

#[OA\Schema(
    schema: "CreateTransactionResponse200",
    type: "object",
    properties: [
        new OA\Property(property: "success", type: "boolean", example: true),
        new OA\Property(property: "data", ref: "#/components/schemas/Transaction")
    ]
)]

#[OA\Schema(
    schema: "UpdateTransactionResponse200",
    type: "object",
    properties: [
        new OA\Property(property: "success", type: "boolean", example: true),
        new OA\Property(property: "data", ref: "#/components/schemas/Transaction")
    ]
)]

#[OA\Schema(
    schema: "DeleteTransactionResponse200",
    type: "object",
    properties: [
        new OA\Property(property: "success", type: "boolean", example: true)
    ]
)]

class Transaction extends Model
{
    protected $table = 'transactions';

    protected $fillable = [
        'car_rental_id',
        'amount',
        'type', // Payment | Refund
        'reference_number',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
    ];

    public function carRental()
    {
        return $this->belongsTo(CarRental::class, 'car_rental_id', 'id');
    }
}
