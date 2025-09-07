<?php

namespace App\Http\Controllers;

use App\Enum\RoleEnum;
use App\Service\UserRequirementService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use OpenApi\Attributes as OA;

class UserRequirementController extends Controller
{
    public function __construct(protected UserRequirementService $service) {
    }

    #[OA\Get(
        path: "/api/UserRequirement/User",
        summary: "Get user requirements",
        tags: ["UserRequirement"],
        description: "Retrieve user requirements by user ID",
        operationId: "getUserRequirements",
    )]
    #[OA\Parameter(
        name: "userId",
        in: "path",
        required: true,
        schema: new OA\Schema(type: "integer")
    )]
    #[OA\Response(
        response: 200,
        description: "Successful operation",
        content: new OA\JsonContent(ref: "#/components/schemas/UserRequirementResponse200")
    )]
    #[OA\Response(
        response: 404,
        description: "UserRequirement not found"
    )]
    #[OA\Response(
        response: 401,
        description: "Unauthorized"
    )]
    #[OA\Response(
        response: 500,
        description: "Internal server error"
    )]
    public function getUserRequirements(Request $request)
    {
        return $this->ok($this->service->getUserRequirements($request->user()->id, $request->user()->role));
    }

    /**
     * Display a listing of the resource.
     */
    #[OA\Get(
        path: "/api/UserRequirement",
        summary: "Get paginated list of UserRequirement",
        tags: ["UserRequirement"],
        description: "Retrieve a paginated list of UserRequirement with optional search",
        operationId:"getUserRequirementPaginated",
    )]
    #[OA\Parameter(
        name: "search",
        in: "query",
        description: "Search term",
        required: false,
        schema: new OA\Schema(type: "string")
    )]
    #[OA\Parameter(
        name: "page",
        in: "query",
        description: "Page number",
        required: false,
        schema: new OA\Schema(type: "integer", default: 0)
    )]
    #[OA\Parameter(
        name: "rows",
        in: "query",
        description: "Number of items per page",
        required: false,
        schema: new OA\Schema(type: "integer", default: 10)
    )]
    #[OA\Parameter(
        name: "role",
        in: "query",
        description: "Role",
        required: false,
        schema: new OA\Schema(type: "string", default: "USER")
    )]
    #[OA\Response(
        response: 200,
        description: "Successful operation",
        content: new OA\JsonContent(ref: "#/components/schemas/PaginatedUserRequirementResponse200")
    )]
    public function index(Request $request)
    {
        $srch = $request->query("search", '');
        $page = $request->query("page", 0);
        $rows = $request->query("rows", 10);
        return $this->ok($this->service->paginate($page, $rows, ['*'], [], []));
    }

    /**
     * Display the specified resource.
     */
    #[OA\Get(
        path: "/api/UserRequirement/{id}",
        summary: "Get a specific UserRequirement",
        tags: ["UserRequirement"],
        description: "Retrieve a UserRequirement by its ID",
        operationId: "getUserRequirementById",
    )]
    #[OA\Parameter(
        name: "id",
        in: "path",
        required: true,
        schema: new OA\Schema(type: "integer")
    )]
    #[OA\Response(
        response: 200,
        description: "Successful operation",
        content: new OA\JsonContent(ref: "#/components/schemas/GetUserRequirementResponse200")
    )]
    #[OA\Response(
        response: 404,
        description: "UserRequirement not found"
    )]
    public function show($id)
    {
        try {
            return $this->ok($this->service->get($id));
        } catch (ModelNotFoundException $e) {
            return $this->notFound('UserRequirement not found');
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    #[OA\Post(
        path: "/api/UserRequirement",
        summary: "Create a new UserRequirement",
        tags: ["UserRequirement"],
        description:" Create a new UserRequirement with the provided details",
        operationId: "createUserRequirement",
    )]
    #[OA\RequestBody(
        required: true,
        content: new OA\MediaType(
            mediaType: "multipart/form-data",
            schema: new OA\Schema(
                type: "object",
                required: ["user_id", "requirement_id", "file"],
                properties: [
                    new OA\Property(property: "user_id", type: "integer", example: 1),
                    new OA\Property(property: "requirement_id", type: "integer", example: 1),
                    new OA\Property(property: "file", type: "string", format: "binary", description: "File to upload"),
                ]
            )
        )
    )]
    #[OA\Response(
        response: 200,
        description: "UserRequirement created successfully",
        content: new OA\JsonContent(ref: "#/components/schemas/CreateUserRequirementResponse200")
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
                'user_id'        => 'required|integer|exists:users,id',
                'requirement_id' => 'required|integer|exists:requirements,id',
            ]);

            if ($validator->fails()) {
                return $this->validationError($validator->errors());
            }

            $validated = $validator->validated();
            $result = $this->service->create($validated);

            $userRequirement = $this->service->get($result->id);
            $userRequirement->clearMediaCollection('user_requirements');
            $userRequirement->addMediaFromRequest('file')
                ->toMediaCollection('user_requirements');

            return $this->ok($result);
        } catch (\Exception $e) {
            return $this->internalServerError($e->getMessage());
        }
    }

    /**
     * Update the specified resource in storage.
     */
    #[OA\Put(
        path: "/api/UserRequirement/{id}",
        summary: "Update a UserRequirement",
        tags: ["UserRequirement"],
        description: "Update an existing UserRequirement with the provided details",
        operationId: "updateUserRequirement",
    )]
    #[OA\Parameter(
        name: "id",
        in: "path",
        required: true,
        schema: new OA\Schema(type: "integer"),
    )]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(ref: "#/components/schemas/UserRequirement")
    )]
    #[OA\Response(
        response: 200,
        description: "UserRequirement updated successfully",
        content: new OA\JsonContent(ref: "#/components/schemas/UpdateUserRequirementResponse200")
    )]
    #[OA\Response(
        response: 404,
        description: "UserRequirement not found"
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
                'user_id'        => 'required|integer|exists:users,id',
                'requirement_id' => 'required|integer|exists:requirements,id',
            ]);

            if ($validator->fails()) {
                return $this->validationError($validator->errors());
            }

            $validated = $validator->validated();

            return $this->ok($this->service->update($id, $validated));
        } catch (ModelNotFoundException $e) {
            return $this->notFound('UserRequirement not found');
        } catch (\Exception $e) {
            return $this->internalServerError($e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    #[OA\Delete(
        path: "/api/UserRequirement/{id}",
        summary: "Delete a UserRequirement",
        tags: ["UserRequirement"],
        description: "Delete a UserRequirement by its ID",
        operationId: "deleteUserRequirement",
    )]
    #[OA\Parameter(
        name: "id",
        in: "path",
        required: true,
        schema: new OA\Schema(type: "integer")
    )]
    #[OA\Response(
        response: 204,
        description: "UserRequirement deleted successfully",
        content: new OA\JsonContent(ref: "#/components/schemas/DeleteUserRequirementResponse200")
    )]
    #[OA\Response(
        response: 404,
        description: "UserRequirement not found"
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
            return $this->notFound('UserRequirement not found');
        } catch (\Exception $e) {
            return $this->internalServerError($e->getMessage());
        }
    }
}
