<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: "Media",
    title: "Media",
    type: "object",
    required: [
        "id",
        "file_name",
        "mime_type",
        "size",
        "url",
        "original_url",
    ],
    properties: [
        new OA\Property(property: "id", type: "integer"),
        new OA\Property(property: "file_name", type: "string"),
        new OA\Property(property: "mime_type", type: "string"),
        new OA\Property(property: "size", type: "integer"),
        new OA\Property(property: "url", type: "string"),
        new OA\Property(property: "original_url", type: "string"),
    ]
)]
class Media extends Model
{
}
