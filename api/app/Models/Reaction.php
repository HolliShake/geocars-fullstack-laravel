<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: "Reaction",
    title: "Reaction",
    type: "object",
    required: [
        'car_posting_id',
        'user_id',
        'reaction',
    ],
    properties: [
        new OA\Property(property: "id", type: "integer", example: 1),
        new OA\Property(property: "car_posting_id", type: "integer", example: 1),
        new OA\Property(property: "user_id", type: "integer", example: 1),
        new OA\Property(property: "reaction", type: "string", example: "like"),
        new OA\Property(property: "created_at", type: "string", format: "date-time", example: "2024-01-01T00:00:00.000000Z"),
        new OA\Property(property: "updated_at", type: "string", format: "date-time", example: "2024-01-01T00:00:00.000000Z"),
    ]
)]

#[OA\Schema(
    schema: "PaginatedReaction",
    title:"PaginatedReaction",
    type: "object",
    properties: [
        new OA\Property(property: "data", type: "array", items: new OA\Items(ref: "#/components/schemas/Reaction")),
        new OA\Property(property: "current_page", type: "integer"),
        new OA\Property(property: "last_page", type: "integer"),
        new OA\Property(property: "per_page", type: "integer"),
        new OA\Property(property: "total", type: "integer"),
        new OA\Property(property: "from", type: "integer", nullable: true),
        new OA\Property(property: "to", type: "integer", nullable: true),
    ]
)]

#[OA\Schema(
    schema: "PaginatedReactionResponse200",
    type: "object",
    properties: [
        new OA\Property(property: "success", type: "boolean", example: true),
        new OA\Property(property: "data", ref: "#/components/schemas/PaginatedReaction")
    ]
)]

#[OA\Schema(
    schema: "GetReactionResponse200",
    type: "object",
    properties: [
        new OA\Property(property: "success", type: "boolean", example: true),
        new OA\Property(property: "data", ref: "#/components/schemas/Reaction")
    ]
)]

#[OA\Schema(
    schema: "CreateReactionResponse200",
    type: "object",
    properties: [
        new OA\Property(property: "success", type: "boolean", example: true),
        new OA\Property(property: "data", ref: "#/components/schemas/Reaction")
    ]
)]

#[OA\Schema(
    schema: "UpdateReactionResponse200",
    type: "object",
    properties: [
        new OA\Property(property: "success", type: "boolean", example: true),
        new OA\Property(property: "data", ref: "#/components/schemas/Reaction")
    ]
)]

#[OA\Schema(
    schema: "DeleteReactionResponse200",
    type: "object",
    properties: [
        new OA\Property(property: "success", type: "boolean", example: true)
    ]
)]

class Reaction extends Model
{
    protected $table = 'reactions';

    public $timestamps = true;

    protected $fillable = [
        'car_posting_id',
        'user_id',
        'reaction',
    ];

    /**
     * Get the car posting that owns the reaction.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function carPosting()
    {
        return $this->belongsTo(CarPosting::class, 'car_posting_id', 'id');
    }
}
