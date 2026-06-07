<?php

namespace App\Models;

use App\Enum\UserAccountTypeEnum;
use Illuminate\Database\Eloquent\Model;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: "UserAccount",
    title: "UserAccount",
    type: "object",
    required: ["user_id", "type", "account_number"],
    properties: [
        new OA\Property(property: "id", type: "integer", example: 1),
        new OA\Property(property: "user_id", type: "integer", example: 12),
        new OA\Property(property: "type", type: "string", enum: ["GCash", "Maya", "Bank"], example: "Bank"),
        new OA\Property(property: "account_number", type: "string", example: "0123456789"),
        new OA\Property(property: "is_default", type: "boolean", example: true),
        new OA\Property(property: "created_at", type: "string", format: "date-time", example: "2026-01-01T00:00:00Z"),
        new OA\Property(property: "updated_at", type: "string", format: "date-time", example: "2026-01-01T00:00:00Z"),
        new OA\Property(property: "owner", type: "object", ref: "#/components/schemas/User"),
    ]
)]
#[OA\Schema(
    schema: "PaginatedUserAccount",
    title: "PaginatedUserAccount",
    type: "object",
    properties: [
        new OA\Property(property: "data", type: "array", items: new OA\Items(ref: "#/components/schemas/UserAccount")),
        new OA\Property(property: "current_page", type: "integer"),
        new OA\Property(property: "last_page", type: "integer"),
        new OA\Property(property: "per_page", type: "integer"),
        new OA\Property(property: "total", type: "integer"),
        new OA\Property(property: "from", type: "integer", nullable: true),
        new OA\Property(property: "to", type: "integer", nullable: true),
    ]
)]
#[OA\Schema(
    schema: "PaginatedUserAccountResponse200",
    type: "object",
    properties: [
        new OA\Property(property: "success", type: "boolean", example: true),
        new OA\Property(property: "data", ref: "#/components/schemas/PaginatedUserAccount"),
    ]
)]
#[OA\Schema(
    schema: "GetUserAccountResponse200",
    type: "object",
    properties: [
        new OA\Property(property: "success", type: "boolean", example: true),
        new OA\Property(property: "data", ref: "#/components/schemas/UserAccount"),
    ]
)]
#[OA\Schema(
    schema: "CreateUserAccountResponse200",
    type: "object",
    properties: [
        new OA\Property(property: "success", type: "boolean", example: true),
        new OA\Property(property: "data", ref: "#/components/schemas/UserAccount"),
    ]
)]
#[OA\Schema(
    schema: "UpdateUserAccountResponse200",
    type: "object",
    properties: [
        new OA\Property(property: "success", type: "boolean", example: true),
        new OA\Property(property: "data", ref: "#/components/schemas/UserAccount"),
    ]
)]
#[OA\Schema(
    schema: "DeleteUserAccountResponse200",
    type: "object",
    properties: [
        new OA\Property(property: "success", type: "boolean", example: true),
    ]
)]
class UserAccount extends Model
{
    protected $table = 'user_accounts';

    protected $fillable = [
        'user_id',
        'type',
        'account_number',
        'is_default',
    ];

    protected function casts(): array
    {
        return [
            'type' => UserAccountTypeEnum::class,
            'is_default' => 'boolean',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function owner()
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }
}
