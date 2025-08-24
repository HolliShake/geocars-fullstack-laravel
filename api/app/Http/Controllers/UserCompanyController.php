<?php

namespace App\Http\Controllers;

use App\Service\UserCompanyService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;
use Validator;

class UserCompanyController extends Controller
{
    public function __construct(protected UserCompanyService $service) {
    }

    /**
     * Display a listing of the resource.
     */
    #[OA\Get(
        path: "/api/UserCompany",
        summary: "Get paginated list of UserCompany",
        tags: ["UserCompany"],
        description: "Retrieve a paginated list of UserCompany with optional search",
        operationId:"getUserCompanyPaginated",
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
    #[OA\Response(
        response: 200,
        description: "Successful operation",
        content: new OA\JsonContent(ref: "#/components/schemas/PaginatedUserCompanyResponse200")
    )]
    public function index(Request $request)
    {
        $srch = $request->query("search", '');
        $page = $request->query("page", 0);
        $rows = $request->query("rows", 10);
        return $this->ok($this->service->paginate($page, $rows, ['*'], ['owner'], [
            'name' => $srch ? ['like', "%{$srch}%"] : null
        ]));
    }

    /**
     * Display the specified resource.
     */
    #[OA\Get(
        path: "/api/UserCompany/{id}",
        summary: "Get a specific UserCompany",
        tags: ["UserCompany"],
        description: "Retrieve a UserCompany by its ID",
        operationId: "getUserCompanyById",
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
        content: new OA\JsonContent(ref: "#/components/schemas/GetUserCompanyResponse200")
    )]
    #[OA\Response(
        response: 404,
        description: "UserCompany not found"
    )]
    public function show($id)
    {
        try {
            return $this->ok($this->service->get($id));
        } catch (ModelNotFoundException $e) {
            return $this->notFound('UserCompany not found');
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    #[OA\Post(
        path: "/api/UserCompany",
        summary: "Create a new UserCompany",
        tags: ["UserCompany"],
        description:" Create a new UserCompany with the provided details",
        operationId: "createUserCompany",
    )]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(ref: "#/components/schemas/UserCompany")
    )]
    #[OA\Response(
        response: 200,
        description: "UserCompany created successfully",
        content: new OA\JsonContent(ref: "#/components/schemas/CreateUserCompanyResponse200")
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
                'user_id'      => 'required|integer|exists:users,id',
                'name'         => 'required|string|max:255',
                'address'      => 'required|string|max:255',
                'city'         => 'required|string|max:255',
                'country'      => 'required|string|max:255',
                'postal_code'  => 'required|string|max:255',
                'opening_time' => 'required|date_format:H:i',
                'closing_time' => 'required|date_format:H:i|after:opening_time',
                'days_open'    => 'sometimes|string|max:255',
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
        path: "/api/UserCompany/{id}",
        summary: "Update a UserCompany",
        tags: ["UserCompany"],
        description: "Update an existing UserCompany with the provided details",
        operationId: "updateUserCompany",
    )]
    #[OA\Parameter(
        name: "id",
        in: "path",
        required: true,
        schema: new OA\Schema(type: "integer"),
    )]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(ref: "#/components/schemas/UserCompany")
    )]
    #[OA\Response(
        response: 200,
        description: "UserCompany updated successfully",
        content: new OA\JsonContent(ref: "#/components/schemas/UpdateUserCompanyResponse200")
    )]
    #[OA\Response(
        response: 404,
        description: "UserCompany not found"
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
                'user_id'      => 'required|integer|exists:users,id',
                'name'         => 'required|string|max:50',
                'address'      => 'required|string|max:255',
                'city'         => 'required|string|max:255',
                'country'      => 'required|string|max:255',
                'postal_code'  => 'required|string|max:255',
                'opening_time' => 'required|date_format:H:i',
                'closing_time' => 'required|date_format:H:i|after:opening_time',
                'days_open'    => 'sometimes|string|max:255',
            ]);
            
            if ($validator->fails()) {
                return $this->validationError($validator->errors());
            }

            $validated = $validator->validated();

            return $this->ok($this->service->update($id, $validated));
        } catch (ModelNotFoundException $e) {
            return $this->notFound('UserCompany not found');
        } catch (\Exception $e) {
            return $this->internalServerError($e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    #[OA\Delete(
        path: "/api/UserCompany/{id}",
        summary: "Delete a UserCompany",
        tags: ["UserCompany"],
        description: "Delete a UserCompany by its ID",
        operationId: "deleteUserCompany",
    )]
    #[OA\Parameter(
        name: "id",
        in: "path",
        required: true,
        schema: new OA\Schema(type: "integer")
    )]
    #[OA\Response(
        response: 204,
        description: "UserCompany deleted successfully",
        content: new OA\JsonContent(ref: "#/components/schemas/DeleteUserCompanyResponse200")
    )]
    #[OA\Response(
        response: 404,
        description: "UserCompany not found"
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
            return $this->notFound('UserCompany not found');
        } catch (\Exception $e) {
            return $this->internalServerError($e->getMessage());
        }
    }
}
