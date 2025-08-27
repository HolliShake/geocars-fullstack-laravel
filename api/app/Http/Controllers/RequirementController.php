<?php

namespace App\Http\Controllers;

use App\Service\RequirementService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use OpenApi\Attributes as OA;

class RequirementController extends Controller
{
    public function __construct(protected RequirementService $service) {
    }

    /**
     * Display a listing of the resource.
     */
    #[OA\Get(
        path: "/api/Requirement",
        summary: "Get paginated list of Requirement",
        tags: ["Requirement"],
        description: "Retrieve a paginated list of Requirement with optional search",
        operationId:"getRequirementPaginated",
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
        schema: new OA\Schema(type: "string", enum: ["admin", "user", "renter"])
    )]
    #[OA\Response(
        response: 200,
        description: "Successful operation",
        content: new OA\JsonContent(ref: "#/components/schemas/PaginatedRequirementResponse200")
    )]
    public function index(Request $request)
    {
        $srch = $request->query("search", '');
        $page = $request->query("page", 0);
        $rows = $request->query("rows", 10);
        $role = $request->query("role", null);
        $conditions = [
            'name' => ['like', "%$srch%"],
            'description' => ['like', "%$srch%"],
        ];

        if ($role) {
            $conditions['role'] = ['=', $role];
        }

        return $this->ok($this->service->paginate($page, $rows, ['*'], [], $conditions));
    }

    /**
     * Display the specified resource.
     */
    #[OA\Get(
        path: "/api/Requirement/{id}",
        summary: "Get a specific Requirement",
        tags: ["Requirement"],
        description: "Retrieve a Requirement by its ID",
        operationId: "getRequirementById",
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
        content: new OA\JsonContent(ref: "#/components/schemas/GetRequirementResponse200")
    )]
    #[OA\Response(
        response: 404,
        description: "Requirement not found"
    )]
    public function show($id)
    {
        try {
            return $this->ok($this->service->get($id));
        } catch (ModelNotFoundException $e) {
            return $this->notFound('Requirement not found');
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    #[OA\Post(
        path: "/api/Requirement",
        summary: "Create a new Requirement",
        tags: ["Requirement"],
        description:" Create a new Requirement with the provided details",
        operationId: "createRequirement",
    )]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(ref: "#/components/schemas/Requirement")
    )]
    #[OA\Response(
        response: 200,
        description: "Requirement created successfully",
        content: new OA\JsonContent(ref: "#/components/schemas/CreateRequirementResponse200")
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
                'name'        => 'required|string|max:255',
                'description' => 'required|string',
                'is_required' => 'required|boolean',
                'is_active'   => 'required|boolean',
                'role'        => 'required|string|in:' . implode(',', array_column(\App\Enum\RoleEnum::cases(), 'value')),
            ]);

            if ($validator->fails()) {
                return $this->validationError($validator->errors());
            }

            $validated = $validator->validated();

            return $this->ok($this->service->create($validated));
        } catch (\Exception $e) {
            return $this->internalServerError($e->getMessage());
        }
    }

    /**
     * Update the specified resource in storage.
     */
    #[OA\Put(
        path: "/api/Requirement/{id}",
        summary: "Update a Requirement",
        tags: ["Requirement"],
        description: "Update an existing Requirement with the provided details",
        operationId: "updateRequirement",
    )]
    #[OA\Parameter(
        name: "id",
        in: "path",
        required: true,
        schema: new OA\Schema(type: "integer"),
    )]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(ref: "#/components/schemas/Requirement")
    )]
    #[OA\Response(
        response: 200,
        description: "Requirement updated successfully",
        content: new OA\JsonContent(ref: "#/components/schemas/UpdateRequirementResponse200")
    )]
    #[OA\Response(
        response: 404,
        description: "Requirement not found"
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
                'name'        => 'required|string|max:255',
                'description' => 'required|string',
                'is_required' => 'required|boolean',
                'is_active'   => 'required|boolean',
                'role'        => 'required|string|in:' . implode(',', array_column(\App\Enum\RoleEnum::cases(), 'value')),
            ]);

            if ($validator->fails()) {
                return $this->validationError($validator->errors());
            }

            $validated = $validator->validated();

            return $this->ok($this->service->update($id, $validated));
        } catch (ModelNotFoundException $e) {
            return $this->notFound('Requirement not found');
        } catch (\Exception $e) {
            return $this->internalServerError($e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    #[OA\Delete(
        path: "/api/Requirement/{id}",
        summary: "Delete a Requirement",
        tags: ["Requirement"],
        description: "Delete a Requirement by its ID",
        operationId: "deleteRequirement",
    )]
    #[OA\Parameter(
        name: "id",
        in: "path",
        required: true,
        schema: new OA\Schema(type: "integer")
    )]
    #[OA\Response(
        response: 204,
        description: "Requirement deleted successfully",
        content: new OA\JsonContent(ref: "#/components/schemas/DeleteRequirementResponse200")
    )]
    #[OA\Response(
        response: 404,
        description: "Requirement not found"
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
            return $this->notFound('Requirement not found');
        } catch (\Exception $e) {
            return $this->internalServerError($e->getMessage());
        }
    }
}
