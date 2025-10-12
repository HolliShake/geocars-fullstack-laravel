<?php

namespace App\Http\Controllers;

use App\Enum\ReactionEnum;
use App\Service\ReactionService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use OpenApi\Attributes as OA;

#[OA\PathItem(
    path: "/plans"
)]
class ReactionController extends Controller
{
    public function __construct(protected ReactionService $service) {
    }

    /**
     * Store a newly created resource in storage.
     */
    #[OA\Post(
        path: "/api/Reaction",
        summary: "Create a new Reaction",
        tags: ["Reaction"],
        description:" Create a new Reaction with the provided details",
        operationId: "createReaction",
    )]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(ref: "#/components/schemas/Reaction")
    )]
    #[OA\Response(
        response: 200,
        description: "Reaction created successfully",
        content: new OA\JsonContent(ref: "#/components/schemas/CreateReactionResponse200")
    )]
    #[OA\Response(
        response: 422,
        description: "Validation error",
        content: new OA\JsonContent(ref: "#/components/schemas/ValidationErrorResponse")
    )]
    #[OA\Response(
        response: 500,
        description: "Internal server error",
        content: new OA\JsonContent(ref: "#/components/schemas/InternalServerErrorResponse")
    )]
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'car_posting_id' => 'required|exists:car_postings,id',
                'reaction' => 'required|string|in:' . implode(',', array_column(ReactionEnum::cases(), 'value')),
                'user_id' => 'exclude_if:user_id,0|exists:users,id',
            ]);

            if ($validator->fails()) {
                return $this->validationError($validator->errors());
            }

            $validated = (array)[
                ...$validator->validated(),
                'user_id' => ($request->input('user_id') != 0)
                    ? $request->input('user_id')
                    : Auth::id(),
            ];

            return $this->ok($this->service->create($validated));
        } catch (\Exception $e) {
            return $this->internalServerError($e->getMessage());
        }
    }

    /**
     * Update the specified resource in storage.
     */
    #[OA\Put(
        path: "/api/Reaction/{id}",
        summary: "Update a Reaction",
        tags: ["Reaction"],
        description: "Update an existing Reaction with the provided details",
        operationId: "updateReaction",
    )]
    #[OA\Parameter(
        name: "id",
        in: "path",
        required: true,
        schema: new OA\Schema(type: "integer"),
    )]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(ref: "#/components/schemas/Reaction")
    )]
    #[OA\Response(
        response: 200,
        description: "Reaction updated successfully",
        content: new OA\JsonContent(ref: "#/components/schemas/UpdateReactionResponse200")
    )]
    #[OA\Response(
        response: 404,
        description: "Reaction not found"
    )]
    #[OA\Response(
        response: 422,
        description: "Validation error",
        content: new OA\JsonContent(ref: "#/components/schemas/ValidationErrorResponse")
    )]
    #[OA\Response(
        response: 500,
        description: "Internal server error",
        content: new OA\JsonContent(ref: "#/components/schemas/InternalServerErrorResponse")
    )]
    public function update(Request $request, $id)
    {
        try {
            $validator = Validator::make($request->all(), [
                'car_posting_id' => 'required|exists:car_postings,id',
                'reaction' => 'required|string|in:' . implode(',', array_column(ReactionEnum::cases(), 'value')),
                'user_id' => 'exclude_if:user_id,0|exists:users,id',
            ]);

            if ($validator->fails()) {
                return $this->validationError($validator->errors());
            }

            $validated = (array)[
                ...$validator->validated(),
                'user_id' => ($request->input('user_id') != 0)
                    ? $request->input('user_id')
                    : Auth::id(),
            ];

            return $this->ok($this->service->update($id, $validated));
        } catch (ModelNotFoundException $e) {
            return $this->notFound('Reaction not found');
        } catch (\Exception $e) {
            return $this->internalServerError($e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    #[OA\Delete(
        path: "/api/Reaction/{id}",
        summary: "Delete a Reaction",
        tags: ["Reaction"],
        description: "Delete a Reaction by its ID",
        operationId: "deleteReaction",
    )]
    #[OA\Parameter(
        name: "id",
        in: "path",
        required: true,
        schema: new OA\Schema(type: "integer")
    )]
    #[OA\Response(
        response: 204,
        description: "Reaction deleted successfully",
        content: new OA\JsonContent(ref: "#/components/schemas/DeleteReactionResponse200")
    )]
    #[OA\Response(
        response: 404,
        description: "Reaction not found"
    )]
    #[OA\Response(
        response: 500,
        description:" Internal server error",
        content: new OA\JsonContent(ref: "#/components/schemas/InternalServerErrorResponse")
    )]
    public function destroy(string $id)
    {
        try {
            $this->service->delete($id);
            return $this->noContent();
        } catch (ModelNotFoundException $e) {
            return $this->notFound('Reaction not found');
        } catch (\Exception $e) {
            return $this->internalServerError($e->getMessage());
        }
    }
}
