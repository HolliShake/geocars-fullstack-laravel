<?php

namespace App\Http\Controllers;

use App\Service\DeviceLocationService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use OpenApi\Attributes as OA;

#[OA\PathItem(
    path: "/deviceLocation"
)]
class DeviceLocationController extends Controller
{
    public function __construct(protected DeviceLocationService $service) {
    }

    /**
     * Display a listing of the resource.
     */
    #[OA\Get(
        path: "/api/DeviceLocation",
        summary: "Get paginated list of DeviceLocation",
        tags: ["DeviceLocation"],
        description: "Retrieve a paginated list of DeviceLocation with optional search",
        operationId:"getDeviceLocationPaginated",
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
        content: new OA\JsonContent(ref: "#/components/schemas/PaginatedDeviceLocationResponse200")
    )]
    public function index(Request $request)
    {
        $srch = $request->query("search", '');
        $page = $request->query("page", 0);
        $rows = $request->query("rows", 10);
        return $this->ok($this->service->paginate($page, $rows));
    }

    /**
     * Display the specified resource.
     */
    #[OA\Get(
        path: "/api/DeviceLocation/{id}",
        summary: "Get a specific DeviceLocation",
        tags: ["DeviceLocation"],
        description: "Retrieve a DeviceLocation by its ID",
        operationId: "getDeviceLocationById",
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
        content: new OA\JsonContent(ref: "#/components/schemas/GetDeviceLocationResponse200")
    )]
    #[OA\Response(
        response: 404,
        description: "DeviceLocation not found"
    )]
    public function show($id)
    {
        try {
            return $this->ok($this->service->get($id));
        } catch (ModelNotFoundException $e) {
            return $this->notFound('DeviceLocation not found');
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    #[OA\Post(
        path: "/api/DeviceLocation",
        summary: "Create a new DeviceLocation",
        tags: ["DeviceLocation"],
        description:" Create a new DeviceLocation with the provided details",
        operationId: "createDeviceLocation",
    )]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(ref: "#/components/schemas/DeviceLocation")
    )]
    #[OA\Response(
        response: 200,
        description: "DeviceLocation created successfully",
        content: new OA\JsonContent(ref: "#/components/schemas/CreateDeviceLocationResponse200")
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
                'latitude' => ['required', 'numeric', 'between:-90,90'],
                'longitude' => ['required', 'numeric', 'between:-180,180'],
                'device_id' => ['required', 'integer', 'exists:devices,id'],
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
        path: "/api/DeviceLocation/{id}",
        summary: "Update a DeviceLocation",
        tags: ["DeviceLocation"],
        description: "Update an existing DeviceLocation with the provided details",
        operationId: "updateDeviceLocation",
    )]
    #[OA\Parameter(
        name: "id",
        in: "path",
        required: true,
        schema: new OA\Schema(type: "integer"),
    )]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(ref: "#/components/schemas/DeviceLocation")
    )]
    #[OA\Response(
        response: 200,
        description: "DeviceLocation updated successfully",
        content: new OA\JsonContent(ref: "#/components/schemas/UpdateDeviceLocationResponse200")
    )]
    #[OA\Response(
        response: 404,
        description: "DeviceLocation not found"
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
                'latitude' => ['required', 'numeric', 'between:-90,90'],
                'longitude' => ['required', 'numeric', 'between:-180,180'],
                'device_id' => ['required', 'integer', 'exists:devices,id'],
            ]);

            if ($validator->fails()) {
                return $this->validationError($validator->errors());
            }

            $validated = $validator->validated();

            return $this->ok($this->service->update($id, $validated));
        } catch (ModelNotFoundException $e) {
            return $this->notFound('DeviceLocation not found');
        } catch (\Exception $e) {
            return $this->internalServerError($e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    #[OA\Delete(
        path: "/api/DeviceLocation/{id}",
        summary: "Delete a DeviceLocation",
        tags: ["DeviceLocation"],
        description: "Delete a DeviceLocation by its ID",
        operationId: "deleteDeviceLocation",
    )]
    #[OA\Parameter(
        name: "id",
        in: "path",
        required: true,
        schema: new OA\Schema(type: "integer")
    )]
    #[OA\Response(
        response: 204,
        description: "DeviceLocation deleted successfully",
        content: new OA\JsonContent(ref: "#/components/schemas/DeleteDeviceLocationResponse200")
    )]
    #[OA\Response(
        response: 404,
        description: "DeviceLocation not found"
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
            return $this->notFound('DeviceLocation not found');
        } catch (\Exception $e) {
            return $this->internalServerError($e->getMessage());
        }
    }
}
