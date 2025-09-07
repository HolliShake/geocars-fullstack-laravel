<?php

namespace App\Models;

use App\Enum\RoleEnum;
use Illuminate\Database\Eloquent\Model;
use OpenApi\Attributes as OA;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

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
        // Computed properties
        new OA\Property(property: "requirement", type: "object", ref: "#/components/schemas/Requirement"),
        new OA\Property(property: "user", type: "object", ref: "#/components/schemas/User"),
        new OA\Property(property: "uploads", type: "object", ref: "#/components/schemas/Media"),
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
    schema: "UserRequirementResponse200",
    title:"UserRequirementResponse200",
    type: "object",
    properties: [
        new OA\Property(property: "success", type: "boolean", example: true),
        new OA\Property(property: "data", type: "array", items: new OA\Items(
            type: "object",
            properties: [
                new OA\Property(property: "id", type: "integer", nullable: true, example: null),
                new OA\Property(property: "created_at", type: "string", format: "date-time", nullable: true, example: null),
                new OA\Property(property: "updated_at", type: "string", format: "date-time", nullable: true, example: null),
                new OA\Property(property: "name", type: "string", example: "Vehicle Registration"),
                new OA\Property(property: "description", type: "string", example: "Provide the Official Receipt (OR) and Certificate of Registration (CR) for all rental vehicles."),
                new OA\Property(property: "is_required", type: "integer", example: 1),
                new OA\Property(property: "is_active", type: "integer", example: 1),
                new OA\Property(property: "role", type: "enum", example: ["admin", "user", "renter"]),
                new OA\Property(property: "user_id", type: "integer", nullable: true, example: null),
                new OA\Property(property: "requirement_id", type: "integer", nullable: true, example: null),
                new OA\Property(property: "media", type: "array", items: new OA\Items(
                    type: "object",
                    properties: [
                        new OA\Property(property: "id", type: "integer", example: 1),
                        new OA\Property(property: "file_name", type: "string", example: "vehicle_registration.pdf"),
                        new OA\Property(property: "mime_type", type: "string", example: "application/pdf"),
                        new OA\Property(property: "size", type: "integer", example: 1000),
                        new OA\Property(property: "url", type: "string", example: "https://example.com/vehicle_registration.pdf")
                    ]
                ))
            ]
        ))
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

class UserRequirement extends Model implements HasMedia
{
    use InteractsWithMedia;

    protected $table = 'user_requirements';

    protected $fillable = [
        'user_id',
        'requirement_id'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function requirement()
    {
        return $this->belongsTo(Requirement::class);
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('user_requirements')
            ->singleFile();
    }

    public function fileAttachment()
    {
        return $this->hasOne(Media::class, 'model_id', 'id')
            ->where('model_type', 'App\\Models\\UserRequirement')
            ->where('collection_name', 'user_requirements');
    }

    public function uploads()
    {
        return $this->hasOne(Media::class, 'model_id', 'id')
            ->where('model_type', 'App\\Models\\UserRequirement')
            ->where('collection_name', 'user_requirements');
    }
}
