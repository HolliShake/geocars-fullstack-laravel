<?php

namespace App\Http\Controllers;

use App\Enum\FuelTypeEnum;
use App\Enum\TransmissionTypeEnum;
use App\Service\CarService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use OpenApi\Attributes as OA;

class CarController extends Controller
{
    public function __construct(protected CarService $service) {
    }

    /**
     * Display a listing of the resource.
     */
    #[OA\Get(
        path: "/api/Car",
        summary: "Get paginated list of Car",
        tags: ["Car"],
        description: "Retrieve a paginated list of Car with optional search",
        operationId:"getCarPaginated",
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
        name: "user_company_id",
        in: "query",
        description: "User company ID",
        required: false,
        schema: new OA\Schema(type: "integer", default: 0)
    )]
    #[OA\Parameter(
        name: "is_available",
        in: "query",
        description: "Is available",
        required: false,
        schema: new OA\Schema(type: "boolean")
    )]
    #[OA\Response(
        response: 200,
        description: "Successful operation",
        content: new OA\JsonContent(ref: "#/components/schemas/PaginatedCarResponse200")
    )]
    public function index(Request $request)
    {
        $srch = $request->query("search", '');
        $page = $request->query("page", 0);
        $rows = $request->query("rows", 10);
        $userCompanyId = $request->query("user_company_id", null);
        $is_available = $request->query("is_available", null);

        $conditions = [
            'brand'           => ['like', "%{$srch}%"],
            'model'           => ['like', "%{$srch}%"],
            'plate_number'    => ['like', "%{$srch}%"],
            'color'           => ['like', "%{$srch}%"],
            'type'            => ['like', "%{$srch}%"],
            'year'            => ['like', "%{$srch}%"],
            'fuel_type'       => ['like', "%{$srch}%"],
        ];

        if ($userCompanyId) {
            $conditions['user_company_id'] = ['&=', $userCompanyId];
        }

        if ($is_available) {
            $conditions['attr:is_available'] = ['=', $is_available];
        }

        return $this->ok($this->service->paginate($page, $rows, ['*'], [], $conditions));
    }

    /**
     * Display the specified resource.
     */
    #[OA\Get(
        path: "/api/Car/{id}",
        summary: "Get a specific Car",
        tags: ["Car"],
        description: "Retrieve a Car by its ID",
        operationId: "getCarById",
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
        content: new OA\JsonContent(ref: "#/components/schemas/GetCarResponse200")
    )]
    #[OA\Response(
        response: 404,
        description: "Car not found"
    )]
    public function show($id)
    {
        try {
            return $this->ok($this->service->get($id));
        } catch (ModelNotFoundException $e) {
            return $this->notFound('Car not found');
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    #[OA\Post(
        path: "/api/Car",
        summary: "Create a new Car",
        tags: ["Car"],
        description:" Create a new Car with the provided details",
        operationId: "createCar",
    )]
    #[OA\RequestBody(
        required: true,
        content: [
            new OA\MediaType(
                mediaType: "multipart/form-data",
                schema: new OA\Schema(
                    type: "object",
                    required: ["user_company_id", "brand", "model", "plate_number", "color", "type", "fuel_type", "transmission"],
                    properties: [
                        new OA\Property(property: "id", type: "integer"),
                        new OA\Property(property: "user_company_id", type: "integer"),
                        new OA\Property(property: "brand", type: "string"),
                        new OA\Property(property: "model", type: "string"),
                        new OA\Property(property: "plate_number", type: "string"),
                        new OA\Property(property: "color", type: "string"),
                        new OA\Property(property: "type", type: "string", enum: ["sedan", "hatchback", "suv", "mpv", "coupe", "convertible", "other"]),
                        new OA\Property(property: "year", type: "string", nullable: true),
                        new OA\Property(property: "fuel_type", type: "string", enum: ["petrol", "diesel", "electric", "hybrid", "other"]),
                        new OA\Property(property: "transmission", type: "string", enum: ["manual", "automatic", "other"]),
                        new OA\Property(property: "engine_capacity", type: "string", nullable: true),
                        new OA\Property(property: "engine_power", type: "string", nullable: true),
                        new OA\Property(property: "engine_torque", type: "string", nullable: true),
                        new OA\Property(property: "engine_type", type: "string", nullable: true),
                        new OA\Property(property: "created_at", type: "string", format: "date-time"),
                        new OA\Property(property: "updated_at", type: "string", format: "date-time"),
                        new OA\Property(
                            property: "images",
                            type: "array",
                            items: new OA\Items(
                                type: "string",
                                format: "binary"
                            ),
                            description: "Car images"
                        )
                    ]
                )
            )
        ]
    )]
    #[OA\Response(
        response: 200,
        description: "Car created successfully",
        content: new OA\JsonContent(ref: "#/components/schemas/CreateCarResponse200")
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
                'user_company_id'   => 'required|integer|exists:user_companies,id',
                'brand'             => 'required|string|max:255',
                'model'             => 'required|string|max:255',
                'plate_number'      => 'required|string|max:255',
                'color'             => 'required|string|max:255',
                'type'              => 'required|string|max:255',
                'year'              => 'nullable|string|max:255',
                'fuel_type'         => 'required|string|in:'.implode(',', array_column(FuelTypeEnum::cases(), 'value')),
                'transmission'      => 'required|string|in:'.implode(',', array_column(TransmissionTypeEnum::cases(), 'value')),
                'engine_capacity'   => 'nullable|string|max:255',
                'engine_power'      => 'nullable|string|max:255',
                'engine_torque'     => 'nullable|string|max:255',
                'engine_type'       => 'nullable|string|max:255',
                'images.*'          => 'image|mimes:jpeg,png,jpg,gif,svg,webp|max:2048',
            ]);

            if ($validator->fails()) {
                return $this->validationError($validator->errors());
            }

            $validated = $validator->validated();
            $car = $this->service->create($validated);

            $car->clearMediaCollection('cars');
            if ($request->hasFile('images')) {
                $car->clearMediaCollection('cars');
                $car->addMultipleMediaFromRequest(['images'])
                ->each(function ($fileAdder) {
                    $fileAdder->toMediaCollection('cars');
                });
            }
            return $this->ok($car);
        } catch (\Exception $e) {
            return $this->internalServerError($e->getMessage());
        }
    }

    /**
     * Update the specified resource in storage.
     */
    #[OA\Post(
        path: "/api/Car/{id}",
        summary: "Update a Car",
        tags: ["Car"],
        description: "Update an existing Car with the provided details",
        operationId: "updateCar",
    )]
    #[OA\Parameter(
        name: "id",
        in: "path",
        required: true,
        schema: new OA\Schema(type: "integer"),
    )]
    #[OA\RequestBody(
        required: true,
        content: [
            new OA\MediaType(
                mediaType: "multipart/form-data",
                schema: new OA\Schema(
                    type: "object",
                    required: ["user_company_id", "brand", "model", "plate_number", "color", "type", "fuel_type", "transmission"],
                    properties: [
                        new OA\Property(property: "id", type: "integer"),
                        new OA\Property(property: "user_company_id", type: "integer"),
                        new OA\Property(property: "brand", type: "string"),
                        new OA\Property(property: "model", type: "string"),
                        new OA\Property(property: "plate_number", type: "string"),
                        new OA\Property(property: "color", type: "string"),
                        new OA\Property(property: "type", type: "string", enum: ["sedan", "hatchback", "suv", "mpv", "coupe", "convertible", "other"]),
                        new OA\Property(property: "year", type: "string", nullable: true),
                        new OA\Property(property: "fuel_type", type: "string", enum: ["petrol", "diesel", "electric", "hybrid", "other"]),
                        new OA\Property(property: "transmission", type: "string", enum: ["manual", "automatic", "other"]),
                        new OA\Property(property: "engine_capacity", type: "string", nullable: true),
                        new OA\Property(property: "engine_power", type: "string", nullable: true),
                        new OA\Property(property: "engine_torque", type: "string", nullable: true),
                        new OA\Property(property: "engine_type", type: "string", nullable: true),
                        new OA\Property(property: "created_at", type: "string", format: "date-time"),
                        new OA\Property(property: "updated_at", type: "string", format: "date-time"),
                        new OA\Property(
                            property: "images",
                            type: "array",
                            items: new OA\Items(
                                type: "string",
                                format: "binary"
                            ),
                            description: "Car images"
                        )
                    ]
                )
            )
        ]
    )]
    #[OA\Response(
        response: 200,
        description: "Car updated successfully",
        content: new OA\JsonContent(ref: "#/components/schemas/UpdateCarResponse200")
    )]
    #[OA\Response(
        response: 404,
        description: "Car not found"
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
                'user_company_id'   => 'required|integer|exists:user_companies,id',
                'brand'             => 'required|string|max:255',
                'model'             => 'required|string|max:255',
                'plate_number'      => 'required|string|max:255',
                'color'             => 'required|string|max:255',
                'type'              => 'required|string|in:sedan,hatchback,suv,mpv,coupe,convertible,other',
                'year'              => 'nullable|string|max:255',
                'fuel_type'         => 'required|string|in:'.implode(',', array_column(FuelTypeEnum::cases(), 'value')),
                'transmission'      => 'required|string|in:'.implode(',', array_column(TransmissionTypeEnum::cases(), 'value')),
                'engine_capacity'   => 'nullable|string|max:255',
                'engine_power'      => 'nullable|string|max:255',
                'engine_torque'     => 'nullable|string|max:255',
                'engine_type'       => 'nullable|string|max:255',
                'images.*' => 'sometimes|file|image|mimes:jpeg,png,jpg,gif,svg,webp|max:2048',
            ]);

            if ($validator->fails()) {
                return $this->validationError($validator->errors());
            }

            $validated = $validator->validated();

            // Remove _method from validated data if it exists
            unset($validated['_method']);

            $car = $this->service->update($id, $validated);

            if ($request->hasFile('images')) {
                $car->clearMediaCollection('cars');
                $car->addMultipleMediaFromRequest(['images'])
                    ->each(function ($fileAdder) {
                        $fileAdder->toMediaCollection('cars');
                    });
            }

            return $this->ok($car);
        } catch (ModelNotFoundException $e) {
            return $this->notFound('Car not found');
        } catch (\Exception $e) {
            return $this->internalServerError($e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    #[OA\Delete(
        path: "/api/Car/{id}",
        summary: "Delete a Car",
        tags: ["Car"],
        description: "Delete a Car by its ID",
        operationId: "deleteCar",
    )]
    #[OA\Parameter(
        name: "id",
        in: "path",
        required: true,
        schema: new OA\Schema(type: "integer")
    )]
    #[OA\Response(
        response: 204,
        description: "Car deleted successfully",
        content: new OA\JsonContent(ref: "#/components/schemas/DeleteCarResponse200")
    )]
    #[OA\Response(
        response: 404,
        description: "Car not found"
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
            return $this->notFound('Car not found');
        } catch (\Exception $e) {
            return $this->internalServerError($e->getMessage());
        }
    }
}
