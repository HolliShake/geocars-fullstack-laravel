<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Passport\Contracts\OAuthenticatable;
use Laravel\Passport\HasApiTokens;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: "User",
    title: "User",
    type: "object",
    required: [
        "id",
        "firstname",
        "lastname",
        "username",
        "phone",
        "country",
        "city",
        "address",
        "postal_code",
        "email",
        "role",
        "is_active",
    ],
    properties: [
        new OA\Property(property: "id", type: "integer", format: "int64"),
        new OA\Property(property: "firstname", type: "string"),
        new OA\Property(property: "lastname", type: "string"),
        new OA\Property(property: "username", type: "string"),
        new OA\Property(property: "phone", type: "string"),
        new OA\Property(property: "country", type: "string"),
        new OA\Property(property: "city", type: "string"),
        new OA\Property(property: "address", type: "string"),
        new OA\Property(property: "postal_code", type: "string"),
        new OA\Property(property: "email", type: "string", format: "email"),
        new OA\Property(property: "role", type: "string", enum: ["admin", "user", "moderator"]),
        new OA\Property(property: "is_active", type: "boolean", example: true),
        // Computed properties
        new OA\Property(property: "name", type: "string"),
    ]
)]

#[OA\Schema(
    schema: "PaginatedUser",
    title:"PaginatedUser",
    type: "object",
    properties: [
        new OA\Property(property: "data", type: "array", items: new OA\Items(ref: "#/components/schemas/User")),
        new OA\Property(property: "current_page", type: "integer"),
        new OA\Property(property: "last_page", type: "integer"),
        new OA\Property(property: "per_page", type: "integer"),
        new OA\Property(property: "total", type: "integer"),
        new OA\Property(property: "from", type: "integer", nullable: true),
        new OA\Property(property: "to", type: "integer", nullable: true),
    ]
)]

#[OA\Schema(
    schema: "PaginatedUserResponse200",
    type: "object",
    properties: [
        new OA\Property(property: "success", type: "boolean", example: true),
        new OA\Property(property: "data", ref: "#/components/schemas/PaginatedUser")
    ]
)]

#[OA\Schema(
    schema: "GetUserResponse200",
    type: "object",
    properties: [
        new OA\Property(property: "success", type: "boolean", example: true),
        new OA\Property(property: "data", ref: "#/components/schemas/User")
    ]
)]

#[OA\Schema(
    schema: "CreateUserResponse200",
    type: "object",
    properties: [
        new OA\Property(property: "success", type: "boolean", example: true),
        new OA\Property(property: "data", ref: "#/components/schemas/User")
    ]
)]

#[OA\Schema(
    schema: "UpdateUserResponse200",
    type: "object",
    properties: [
        new OA\Property(property: "success", type: "boolean", example: true),
        new OA\Property(property: "data", ref: "#/components/schemas/User")
    ]
)]

#[OA\Schema(
    schema: "DeleteUserResponse200",
    type: "object",
    properties: [
        new OA\Property(property: "success", type: "boolean", example: true)
    ]
)]

class User extends Authenticatable implements OAuthenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = "users";

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'firstname',
        'lastname',
        'username',
        'phone',
        'country',
        'city',
        'address',
        'postal_code',
        'email',
        'role',
        'is_active',
        'password',
        'email_verified_at',
        'remember_token',
    ];

    /**
     * The attributes that should be appended to the model's array form.
     *
     * @var list<string>
     */
    protected $appends = [
        'name',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    public function getNameAttribute(): string
    {
        return $this->firstname . ' ' . $this->lastname;
    }
}
