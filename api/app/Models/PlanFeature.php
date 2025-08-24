<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: "PlanFeature",
    title: "PlanFeature",
    type: "object",
    required: [
        "id",
        "name",
        "value"
    ],
    properties: [
        new OA\Property(property: "id", type: "integer", example: 1),
        new OA\Property(property: "plan_id", type: "integer", example: 1),
        new OA\Property(property: "name", type: "string", example: "Storage Limit"),
        new OA\Property(property: "value", type: "string", example: "100GB"),
        new OA\Property(property: "created_at", type: "string", format: "date-time", example: "2023-01-01T00:00:00Z"),
        new OA\Property(property: "updated_at", type: "string", format: "date-time", example: "2023-01-01T00:00:00Z"),
    ]
)]

#[OA\Schema(
    schema: "PaginatedPlanFeature",
    title:"PaginatedPlanFeature",
    type: "object",
    properties: [
        new OA\Property(property: "data", type: "array", items: new OA\Items(ref: "#/components/schemas/PlanFeature")),
        new OA\Property(property: "current_page", type: "integer"),
        new OA\Property(property: "last_page", type: "integer"),
        new OA\Property(property: "per_page", type: "integer"),
        new OA\Property(property: "total", type: "integer"),
        new OA\Property(property: "from", type: "integer", nullable: true),
        new OA\Property(property: "to", type: "integer", nullable: true),
    ]
)]

#[OA\Schema(
    schema: "PaginatedPlanFeatureResponse200",
    type: "object",
    properties: [
        new OA\Property(property: "success", type: "boolean", example: true),
        new OA\Property(property: "data", ref: "#/components/schemas/PaginatedPlanFeature")
    ]
)]

#[OA\Schema(
    schema: "GetPlanFeatureResponse200",
    type: "object",
    properties: [
        new OA\Property(property: "success", type: "boolean", example: true),
        new OA\Property(property: "data", ref: "#/components/schemas/PlanFeature")
    ]
)]

#[OA\Schema(
    schema: "CreatePlanFeatureResponse200",
    type: "object",
    properties: [
        new OA\Property(property: "success", type: "boolean", example: true),
        new OA\Property(property: "data", ref: "#/components/schemas/PlanFeature")
    ]
)]

#[OA\Schema(
    schema: "UpdatePlanFeatureResponse200",
    type: "object",
    properties: [
        new OA\Property(property: "success", type: "boolean", example: true),
        new OA\Property(property: "data", ref: "#/components/schemas/PlanFeature")
    ]
)]

#[OA\Schema(
    schema: "DeletePlanFeatureResponse200",
    type: "object",
    properties: [
        new OA\Property(property: "success", type: "boolean", example: true)
    ]
)]

class PlanFeature extends Model
{
    protected $table = 'plan_features';

    protected $fillable = [
        'plan_id',
        'name',
        'value',
    ];

    public function plan()
    {
        return $this->belongsTo(Plan::class, 'plan_id', 'id');
    }
}
