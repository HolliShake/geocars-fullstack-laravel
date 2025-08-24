<?php

namespace App\Http\Controllers;

use App\Service\PlanFeatureService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;
use Validator;

class PlanFeatureController extends Controller
{
    public function __construct(protected PlanFeatureService $service) {
    }

    /**
     * Display a listing of the resource.
     */
    #[OA\Get(
        path: "/api/PlanFeature",
        summary: "Get paginated list of PlanFeature",
        tags: ["PlanFeature"],
        description: "Retrieve a paginated list of PlanFeature with optional search",
        operationId:"getPlanFeaturePaginated",
    )]
    #[OA\Parameter(
        name: "plan_id",
        in: "query",
        description: "Plan ID",
        required: false,
        schema: new OA\Schema(type: "integer", default: 0)
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
        content: new OA\JsonContent(ref: "#/components/schemas/PaginatedPlanFeatureResponse200")
    )]
    public function index(Request $request)
    {
        $srch = $request->query("search", '');
        $page = $request->query("page", 0);
        $rows = $request->query("rows", 10);
        $planId = $request->query("plan_id", null);

        $conditions = [];
        if ($planId) {
            $conditions['plan_id'] = ['=', $planId];
            $conditions['name'] = $srch ? ['like', "%{$srch}%"] : null;
        }

        return $this->ok($this->service->paginate($page, $rows, ['*'], [], $conditions));
    }

    /**
     * Display the specified resource.
     */
    #[OA\Get(
        path: "/api/PlanFeature/{id}",
        summary: "Get a specific PlanFeature",
        tags: ["PlanFeature"],
        description: "Retrieve a PlanFeature by its ID",
        operationId: "getPlanFeatureById",
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
        content: new OA\JsonContent(ref: "#/components/schemas/GetPlanFeatureResponse200")
    )]
    #[OA\Response(
        response: 404,
        description: "PlanFeature not found"
    )]
    public function show($id)
    {
        try {
            return $this->ok($this->service->get($id));
        } catch (ModelNotFoundException $e) {
            return $this->notFound('PlanFeature not found');
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    #[OA\Post(
        path: "/api/PlanFeature",
        summary: "Create a new PlanFeature",
        tags: ["PlanFeature"],
        description:" Create a new PlanFeature with the provided details",
        operationId: "createPlanFeature",
    )]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(ref: "#/components/schemas/PlanFeature")
    )]
    #[OA\Response(
        response: 200,
        description: "PlanFeature created successfully",
        content: new OA\JsonContent(ref: "#/components/schemas/CreatePlanFeatureResponse200")
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
                "plan_id" => "required|exists:plans,id",
                "name" => "required|string|max:50",
                "value" => "required|string|max:255",
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
        path: "/api/PlanFeature/{id}",
        summary: "Update a PlanFeature",
        tags: ["PlanFeature"],
        description: "Update an existing PlanFeature with the provided details",
        operationId: "updatePlanFeature",
    )]
    #[OA\Parameter(
        name: "id",
        in: "path",
        required: true,
        schema: new OA\Schema(type: "integer"),
    )]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(ref: "#/components/schemas/PlanFeature")
    )]
    #[OA\Response(
        response: 200,
        description: "PlanFeature updated successfully",
        content: new OA\JsonContent(ref: "#/components/schemas/UpdatePlanFeatureResponse200")
    )]
    #[OA\Response(
        response: 404,
        description: "PlanFeature not found"
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
                "plan_id" => "required|exists:plans,id",
                "name" => "required|string|max:50",
                "value" => "required|string|max:255",
            ]);
            
            if ($validator->fails()) {
                return $this->validationError($validator->errors());
            }

            $validated = $validator->validated();

            return $this->ok($this->service->update($id, $validated));
        } catch (ModelNotFoundException $e) {
            return $this->notFound('PlanFeature not found');
        } catch (\Exception $e) {
            return $this->internalServerError($e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    #[OA\Delete(
        path: "/api/PlanFeature/{id}",
        summary: "Delete a PlanFeature",
        tags: ["PlanFeature"],
        description: "Delete a PlanFeature by its ID",
        operationId: "deletePlanFeature",
    )]
    #[OA\Parameter(
        name: "id",
        in: "path",
        required: true,
        schema: new OA\Schema(type: "integer")
    )]
    #[OA\Response(
        response: 204,
        description: "PlanFeature deleted successfully",
        content: new OA\JsonContent(ref: "#/components/schemas/DeletePlanFeatureResponse200")
    )]
    #[OA\Response(
        response: 404,
        description: "PlanFeature not found"
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
            return $this->notFound('PlanFeature not found');
        } catch (\Exception $e) {
            return $this->internalServerError($e->getMessage());
        }
    }
}
