<?php

namespace App\Http\Controllers;

use App\Service\PlanService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use OpenApi\Attributes as OA;

#[OA\PathItem(
    path: "/plans"
)]
class PlanController extends Controller
{
    public function __construct(protected PlanService $service) {
    }

    #[OA\Get(
        path: "/api/Plan",
        summary: "Get paginated list of plans",
        tags: ["Plans"],
        description: "Retrieve a paginated list of plans with optional search",
        operationId:"getPlansPaginated",
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
        content: new OA\JsonContent(ref: "#/components/schemas/PaginatedPlanResponse200")
    )]
    public function index(Request $request)
    {
        $srch = $request->query("search", '');
        $page = $request->query("page", 0);
        $rows = $request->query("rows", 10);
        return $this->ok($this->service->paginate($page, $rows, ['*'], [], conditions: [
            "name" => $srch ? ['like', "%{$srch}%"] : null,
        ]));
    }

    #[OA\Get(
        path: "/api/Plan/{id}",
        summary: "Get a specific plan",
        tags: ["Plans"],
        description: "Retrieve a plan by its ID",
        operationId: "getPlanById",
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
        content: new OA\JsonContent(ref: "#/components/schemas/GetPlanResponse200")
    )]
    #[OA\Response(
        response: 404,
        description: "Plan not found"
    )]
    public function show($id)
    {
        try {
            return $this->ok($this->service->get($id));
        } catch (ModelNotFoundException $e) {
            return $this->notFound('Plan not found');
        }
    }

    #[OA\Post(
        path: "/api/Plan",
        summary: "Create a new plan",
        tags: ["Plans"],
        description:" Create a new plan with the provided details",
        operationId: "createPlan",
    )]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(ref: "#/components/schemas/Plan")
    )]
    #[OA\Response(
        response: 200,
        description: "Plan created successfully",
        content: new OA\JsonContent(ref: "#/components/schemas/CreatePlanResponse200")
    )]
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                "name"        => "required|string|max:50",
                "description" => "required|string|max:255",
                "price"       => "required|numeric|min:0",
                "active"      => "required|boolean",
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

    #[OA\Put(
        path: "/api/Plan/{id}",
        summary: "Update a plan",
        tags: ["Plans"],
        description: "Update an existing plan with the provided details",
        operationId: "updatePlan",
    )]
    #[OA\Parameter(
        name: "id",
        in: "path",
        required: true,
        schema: new OA\Schema(type: "integer"),
    )]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(ref: "#/components/schemas/Plan")
    )]
    #[OA\Response(
        response: 200,
        description: "Plan updated successfully",
        content: new OA\JsonContent(ref: "#/components/schemas/UpdatePlanResponse200")
    )]
    #[OA\Response(
        response: 404,
        description: "Plan not found",
        content: new OA\JsonContent(ref: "#/components/schemas/NotFoundResponse")
    )]
    public function update(Request $request, $id)
    {
        try {
            $validator = Validator::make($request->all(), [
                "name"        => "required|string|max:50",
                "description" => "required|string|max:255",
                "price"       => "required|numeric|min:0",
                "active"      => "required|boolean",
            ]);

            if ($validator->fails()) {
                return $this->validationError($validator->errors());
            }

            $validated = $validator->validated();

            return $this->ok($this->service->update($id, $validated));
        } catch (ModelNotFoundException $e) {
            return $this->notFound('Plan not found');
        } catch (\Exception $e) {
            return $this->internalServerError($e->getMessage());
        }
    }

    #[OA\Delete(
        path: "/api/Plan/{id}",
        summary: "Delete a plan",
        tags: ["Plans"],
        description: "Delete a plan by its ID",
        operationId: "deletePlan",
    )]
    #[OA\Parameter(
        name: "id",
        in: "path",
        required: true,
        schema: new OA\Schema(type: "integer")
    )]
    #[OA\Response(
        response: 204,
        description: "Plan deleted successfully",
        content: new OA\JsonContent(ref: "#/components/schemas/DeletePlanResponse200")
    )]
    #[OA\Response(
        response: 404,
        description: "Plan not found",
        content: new OA\JsonContent(ref: "#/components/schemas/NotFoundResponse")
    )]
    public function destroy($id)
    {
        try {
            $this->service->delete($id);
            return $this->noContent();
        } catch (ModelNotFoundException $e) {
            return $this->notFound('Plan not found');
        }
    }
}
