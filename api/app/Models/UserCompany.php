<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Openapi\Attributes as OA;

#[OA\Schema(
    schema: "UserCompany",
    title: "UserCompany",
    type: "object",
    required: [
        "user_id",
        "name",
        "address",
        "city",
        "country",
        "postal_code",
        "opening_time",
        "closing_time"
    ],
    properties: [
        // Override fillables
        new OA\Property(property: "id", type: "integer", example: 1),
        new OA\Property(property: "user_id", type: "integer", example: 1),
        new OA\Property(property: "name", type: "string", example: "Acme Corporation"),
        new OA\Property(property: "address", type: "string", example: "123 Main Street"),
        new OA\Property(property: "city", type: "string", example: "New York"),
        new OA\Property(property: "country", type: "string", example: "USA"),
        new OA\Property(property: "postal_code", type: "string", example: "10001"),
        new OA\Property(property: "opening_time", type: "string", format: "time", example: "09:00:00"),
        new OA\Property(property: "closing_time", type: "string", format: "time", example: "17:00:00"),
        new OA\Property(property: "days_open", type: "string", example: "Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday"),
        new OA\Property(property: "created_at", type: "string", format: "date-time", example: "2023-01-01T00:00:00Z"),
        new OA\Property(property: "updated_at", type: "string", format: "date-time", example: "2023-01-01T00:00:00Z"),
        // Computed navigational property (User)
        new OA\Property(property: "owner", type: "object", ref: "#/components/schemas/User", description: "The user that owns the company"),
    ]
)]

#[OA\Schema(
    schema: "PaginatedUserCompany",
    title:"PaginatedUserCompany",
    type: "object",
    properties: [
        new OA\Property(property: "data", type: "array", items: new OA\Items(ref: "#/components/schemas/UserCompany")),
        new OA\Property(property: "current_page", type: "integer"),
        new OA\Property(property: "last_page", type: "integer"),
        new OA\Property(property: "per_page", type: "integer"),
        new OA\Property(property: "total", type: "integer"),
        new OA\Property(property: "from", type: "integer", nullable: true),
        new OA\Property(property: "to", type: "integer", nullable: true),
    ]
)]

#[OA\Schema(
    schema: "PaginatedUserCompanyResponse200",
    type: "object",
    properties: [
        new OA\Property(property: "success", type: "boolean", example: true),
        new OA\Property(property: "data", ref: "#/components/schemas/PaginatedUserCompany")
    ]
)]

#[OA\Schema(
    schema: "GetUserCompanyResponse200",
    type: "object",
    properties: [
        new OA\Property(property: "success", type: "boolean", example: true),
        new OA\Property(property: "data", ref: "#/components/schemas/UserCompany")
    ]
)]

#[OA\Schema(
    schema: "CreateUserCompanyResponse200",
    type: "object",
    properties: [
        new OA\Property(property: "success", type: "boolean", example: true),
        new OA\Property(property: "data", ref: "#/components/schemas/UserCompany")
    ]
)]

#[OA\Schema(
    schema: "UpdateUserCompanyResponse200",
    type: "object",
    properties: [
        new OA\Property(property: "success", type: "boolean", example: true),
        new OA\Property(property: "data", ref: "#/components/schemas/UserCompany")
    ]
)]

#[OA\Schema(
    schema: "DeleteUserCompanyResponse200",
    type: "object",
    properties: [
        new OA\Property(property: "success", type: "boolean", example: true)
    ]
)]

class UserCompany extends Model
{
    //
    protected $table = "user_companies";

    protected $fillable = [
        'user_id',
        'name',
        'address',
        'city',
        'country',
        'postal_code',
        'opening_time',
        'closing_time',
        'days_open'
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'opening_time' => 'datetime:H:i:s',
            'closing_time' => 'datetime:H:i:s',
            'created_at' => 'datetime',
            'updated_at' => 'datetime'
        ];
    }

    /**
     * Get the user that owns the company.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function owner() {
        return $this->belongsTo(User::class,'user_id','id');
    }

    /**
     * Get the cars associated with the company.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function cars() {
        return $this->hasMany(Car::class,'user_company_id','id');
    }
}
