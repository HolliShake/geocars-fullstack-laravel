<?php

namespace App\Http\Controllers;

use OpenApi\Attributes as OA;

#[OA\Info(
    title: 'Geocars API',
    version: '1.0.0',
    description: 'API documentation for the Geocars application'
)]
#[OA\SecurityScheme(
    securityScheme: 'bearerAuth',
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT'
)]
#[OA\OpenApi(
    servers: [
        new OA\Server(url: 'http://localhost/api/v1', description: 'Local server'),
    ]
)]

/**
 * --- Shared Response Schemas ---
 */
#[OA\Schema(
    schema: 'UnauthenticatedResponse',
    type: 'object',
    required: ['message'],
    properties: [
        new OA\Property(property: 'message', type: 'string', example: 'Unauthenticated.'),
    ]
)]
#[OA\Schema(
    schema: 'NotFoundResponse',
    description: 'Standard not found response',
    type: 'object',
    properties: [
        new OA\Property(property: 'status', type: 'string', example: 'error'),
        new OA\Property(property: 'message', type: 'string', example: 'The route could not be found.'),
    ]
)]
#[OA\Schema(
    schema: 'BadRequestResponse',
    description: 'Standard bad request response',
    type: 'object',
    properties: [
        new OA\Property(property: 'status', type: 'string', example: 'error'),
        new OA\Property(property: 'message', type: 'string', example: 'Bad request.'),
    ]
)]
#[OA\Schema(
    schema: 'ValidationErrorResponse',
    type: 'object',
    required: ['message'],
    properties: [
        new OA\Property(property: 'message', type: 'string', example: 'The title field is required. (and 3 more errors)'),
        new OA\Property(
            property: 'errors',
            type: 'object',
            additionalProperties: new OA\AdditionalProperties(
                type: 'array',
                items: new OA\Items(type: 'string', example: 'The field is required.')
            )
        ),
    ]
)]
#[OA\Schema(
    schema: 'SuccessResponse',
    type: 'object',
    description: 'Standard success response',
    properties: [
        new OA\Property(property: 'status', type: 'string', example: 'success'),
        new OA\Property(property: 'data', type: 'object', description: 'The data returned by the API', nullable: true),
    ]
)]
#[OA\Schema(
    schema: 'InternalServerErrorResponse',
    type: 'object',
    description: 'Standard internal server error response',
    properties: [
        new OA\Property(property: 'status', type: 'string', example: 'error'),
        new OA\Property(property: 'message', type: 'string', example: 'Error message.'),
    ]
)]
#[OA\Schema(
    schema: 'MetaData',
    description: 'Pagination and metadata for the response',
    required: ['current_page', 'last_page', 'per_page', 'total'],
    properties: [
        new OA\Property(property: 'current_page', type: 'integer', example: 1),
        new OA\Property(property: 'last_page', type: 'integer', example: 1),
        new OA\Property(property: 'per_page', type: 'integer', example: 10),
        new OA\Property(property: 'total', type: 'integer', example: 8),
    ]
)]
abstract class Controller
{
    #[OA\Response(
        response: 200,
        description: 'Successful response',
        content: new OA\JsonContent(ref: '#/components/schemas/SuccessResponse')
    )]
    public function ok($data) {
        return response()->json([
            'status' => 'success',
            'data' => $data
        ], 200);
    }

    #[OA\Response(
        response: 204,
        description: 'No content response',
        content: new OA\JsonContent(ref: '#/components/schemas/SuccessResponse')
    )]
    public function noContent() {
        return response()->json([
            'status' => 'success',
            'data' => null,
        ], 204);
    }

    #[OA\Response(
        response: 400,
        description: 'Bad request',
        content: new OA\JsonContent(ref: '#/components/schemas/BadRequestResponse')
    )]
    public function badRequest($data) {
        return response()->json([
            'status' => 'error',
            'message' => $data
        ], 400);
    }

    #[OA\Response(
        response: 401,
        description: 'Unauthenticated',
        content: new OA\JsonContent(ref: '#/components/schemas/UnauthenticatedResponse')
    )]
    public function unauthorized($data) {
        return response()->json([
            'status' => 'error',
            'message' => $data
        ], 401);
    }

    #[OA\Response(
        response: 403,
        description: 'Forbidden',
        content: new OA\JsonContent(ref: '#/components/schemas/BadRequestResponse')
    )]
    public function forbidden($data) {
        return response()->json([
            'status' => 'error',
            'message' => $data
        ], 403);
    }

    #[OA\Response(
        response: 404,
        description: 'Not found',
        content: new OA\JsonContent(ref: '#/components/schemas/NotFoundResponse')
    )]
    public function notFound($data) {
        return response()->json([
            'status' => 'error',
            'message' => $data
        ], 404);
    }

    #[OA\Response(
        response: 409,
        description: 'Conflict',
        content: new OA\JsonContent(ref: '#/components/schemas/BadRequestResponse')
    )]
    public function conflict($data) {
        return response()->json([
            'status' => 'error',
            'message' => $data
        ], 409);
    }

    #[OA\Response(
        response: 422,
        description: 'Validation error',
        content: new OA\JsonContent(ref: '#/components/schemas/ValidationErrorResponse')
    )]
    public function validationError($errors)
    {
        if ($errors instanceof \Illuminate\Support\MessageBag) {
            $errors = $errors->toArray();
        }

        $flatErrors = collect($errors)->flatten();
        $summary = $flatErrors->first() ?? 'Validation failed.';
        if ($flatErrors->count() > 1) {
            $summary .= ' (and ' . ($flatErrors->count() - 1) . ' more errors)';
        }

        return response()->json([
            'message' => $summary,
            'errors' => $errors,
        ], 422);
    }

    #[OA\Response(
        response: 500,
        description: 'Internal Server Error',
        content: new OA\JsonContent(ref: '#/components/schemas/InternalServerErrorResponse')
    )]
    public function internalServerError($data) {
        return response()->json([
            'status' => 'error',
            'message' => $data
        ], 500);
    }
}
