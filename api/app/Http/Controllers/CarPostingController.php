<?php

namespace App\Http\Controllers;

use App\Service\CarPostingService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use OpenApi\Attributes as OA;

class CarPostingController extends Controller
{
    public function __construct(protected CarPostingService $service) {
    }

    /**
     * Display a listing of the resource.
     */
    #[OA\Get(
        path: "/api/CarPosting",
        summary: "Get paginated list of CarPosting",
        tags: ["CarPosting"],
        description: "Retrieve a paginated list of CarPosting with optional search",
        operationId:"getCarPostingPaginated",
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
        name: "company_id",
        in: "query",
        description: "Company ID",
        required: false,
        schema: new OA\Schema(type: "integer")
    )]
    #[OA\Parameter(
        name: "is_available",
        in: "query",
        description: "Is available",
        required: false,
        schema: new OA\Schema(type: "boolean")
    )]
    #[OA\Parameter(
        name: "status",
        in: "query",
        description: "Posting status filter: one of 'all', 'active', 'expired'",
        required: false,
        schema: new OA\Schema(type: "string", enum: ["all", "active", "expired"], default: "all")
    )]
    #[OA\Response(
        response: 200,
        description: "Successful operation",
        content: new OA\JsonContent(ref: "#/components/schemas/PaginatedCarPostingResponse200")
    )]
    public function index(Request $request)
    {
        $srch = $request->query("search", '');
        $page = $request->query("page", 0);
        $rows = $request->query("rows", 10);
        $company_id = $request->query("company_id", null);
        $is_available = $request->query("is_available", null);
        $status = strtolower($request->query("status", 'all'));

        $conditions = [
            "description" => ['like', "%{$srch}%"],
        ];

        if ($company_id) {
            $conditions["car.user_company_id"] = ['=', $company_id];
        }

        // Date-based status filtering
        if ($status === 'active') {
            $conditions["end_date"] = ['>=', now()];
            if ($is_available !== null) {
                $conditions["is_available"] = ['=', $is_available];
            }
        } else if ($status === 'expired') {
            $conditions["end_date"] = ['<', now()];
        }
        // For 'all' status, no additional date filtering is applied

        return $this->ok($this->service->paginate($page, $rows, ['*'], ['car'], $conditions));
    }

    /**
     * Display the specified resource.
     */
    #[OA\Get(
        path: "/api/CarPosting/{id}",
        summary: "Get a specific CarPosting",
        tags: ["CarPosting"],
        description: "Retrieve a CarPosting by its ID",
        operationId: "getCarPostingById",
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
        content: new OA\JsonContent(ref: "#/components/schemas/GetCarPostingResponse200")
    )]
    #[OA\Response(
        response: 404,
        description: "CarPosting not found"
    )]
    public function show($id)
    {
        try {
            return $this->ok($this->service->get($id));
        } catch (ModelNotFoundException $e) {
            return $this->notFound('CarPosting not found');
        }
    }

    #[OA\Get(
        path: "/api/CarPosting/Browse",
        summary: "Get a specific CarPosting",
        tags: ["CarPosting"],
        description: "Retrieve active CarPosting",
        operationId: "browseCarPosting",
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
        content: new OA\JsonContent(ref: "#/components/schemas/PaginatedCarPostingResponse200")
    )]
    public function browse(Request $request)
    {
        $conditions = [
            "description" => ['like', "%{$request->query('search', '')}%"],
            "end_date" => ['>=', now()],
        ];

        $result = $this->service->paginate(
            $request->query('page', 0),
            $request->query('rows', 10),
            ['*'],
            ['car', 'car.userCompany.owner.subscription.plan'],
            $conditions
        );

        // Filter by is_available attribute and sort by user plan priority
        if (isset($result['data'])) {
            $result['data'] = collect($result['data'])
                ->filter(function ($posting) {
                    return $posting->is_available === true;
                })
                ->sortByDesc(function ($posting) {
                    return $posting->user_company->user->subscription->plan->price ?? 0;
                })
                ->values()
                ->all();
        }

        return $this->ok($result);
    }

    /**
     * Store a newly created resource in storage.
     */
    #[OA\Post(
        path: "/api/CarPosting",
        summary: "Create a new CarPosting",
        tags: ["CarPosting"],
        description:" Create a new CarPosting with the provided details",
        operationId: "createCarPosting",
    )]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(ref: "#/components/schemas/CarPosting")
    )]
    #[OA\Response(
        response: 200,
        description: "CarPosting created successfully",
        content: new OA\JsonContent(ref: "#/components/schemas/CreateCarPostingResponse200")
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
                'car_id'         => 'required|integer|exists:cars,id',
                'start_date'     => 'required|date|after_or_equal:now',
                'end_date'       => 'required|date|after:start_date',
                'description'    => 'required|string|max:1000',
                'price'          => 'required|numeric|min:0|max:999999.99',
                'force_enabled'  => 'boolean',
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
        path: "/api/CarPosting/{id}",
        summary: "Update a CarPosting",
        tags: ["CarPosting"],
        description: "Update an existing CarPosting with the provided details",
        operationId: "updateCarPosting",
    )]
    #[OA\Parameter(
        name: "id",
        in: "path",
        required: true,
        schema: new OA\Schema(type: "integer"),
    )]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(ref: "#/components/schemas/CarPosting")
    )]
    #[OA\Response(
        response: 200,
        description: "CarPosting updated successfully",
        content: new OA\JsonContent(ref: "#/components/schemas/UpdateCarPostingResponse200")
    )]
    #[OA\Response(
        response: 404,
        description: "CarPosting not found"
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
                'car_id'         => 'sometimes|required|integer|exists:cars,id',
                'company_id'     => 'sometimes|required|integer|exists:user_companies,id',
                'start_date'     => 'sometimes|required|date|after_or_equal:now',
                'end_date'       => 'sometimes|required|date|after:start_date',
                'description'    => 'sometimes|required|string|max:1000',
                'price'          => 'sometimes|required|numeric|min:0|max:999999.99',
                'force_enabled'  => 'sometimes|boolean',
            ]);

            if ($validator->fails()) {
                return $this->validationError($validator->errors());
            }

            $validated = $validator->validated();

            return $this->ok($this->service->update($id, $validated));
        } catch (ModelNotFoundException $e) {
            return $this->notFound('CarPosting not found');
        } catch (\Exception $e) {
            return $this->internalServerError($e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    #[OA\Delete(
        path: "/api/CarPosting/{id}",
        summary: "Delete a CarPosting",
        tags: ["CarPosting"],
        description: "Delete a CarPosting by its ID",
        operationId: "deleteCarPosting",
    )]
    #[OA\Parameter(
        name: "id",
        in: "path",
        required: true,
        schema: new OA\Schema(type: "integer")
    )]
    #[OA\Response(
        response: 204,
        description: "CarPosting deleted successfully",
        content: new OA\JsonContent(ref: "#/components/schemas/DeleteCarPostingResponse200")
    )]
    #[OA\Response(
        response: 404,
        description: "CarPosting not found"
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
            return $this->notFound('CarPosting not found');
        } catch (\Exception $e) {
            return $this->internalServerError($e->getMessage());
        }
    }
}
