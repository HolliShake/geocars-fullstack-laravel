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
    schema: "SignupRequest",
    required: ["name", "email", "password", "password_confirmation"],
    properties: [
        new OA\Property(property: "firstname", type: "string", description: "The first name of the user"),
        new OA\Property(property: "lastname", type: "string", description: "The last name of the user"),
        new OA\Property(property: "username", type: "string", description: "The username of the user"),
        new OA\Property(property: "phone", type: "string", description: "The phone number of the user", nullable: true),
        new OA\Property(property: "country", type: "string", description: "The country of the user", nullable: true),
        new OA\Property(property: "city", type: "string", description: "The city of the user", nullable: true),
        new OA\Property(property: "address", type: "string", description: "The address of the user", nullable: true),
        new OA\Property(property: "postal_code", type: "string", description: "The postal code of the user", nullable: true),
        new OA\Property(property: "email", type: "string", description: "The email of the user"),
        new OA\Property(property: "password", type: "string", description: "The password of the user"),
        new OA\Property(property: "password_confirmation", type: "string", description: "The password confirmation of the user")
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
