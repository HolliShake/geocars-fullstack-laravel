<?php

namespace App\Models;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: "Auth",
    required: ["token", "role"],
    properties: [
        new OA\Property(
            property: "token",
            type: "string",
            description: "The token for the user"
        ),
        new OA\Property(
            property: "role",
            type: "string",
            description: "The role of the user"
        )
    ]
)]

#[OA\Schema(
    schema: "LoginRequest",
    required: ["email", "password"],
    properties: [
        new OA\Property(
            property: "email",
            type: "string",
            description: "The email of the user"
        ),
        new OA\Property(
            property: "password",
            type: "string",
            description: "The password of the user"
        )
    ]
)]

#[OA\Schema(
    schema: "AuthResponse200",
    type: "object",
    properties: [
        new OA\Property(property: "success", type: "boolean", example: true),
        new OA\Property(property: "data", ref: "#/components/schemas/Auth")
    ]
)]
class Auth {}