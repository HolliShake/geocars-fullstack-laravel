<?php

namespace App\Http\Controllers;

use App\Service\DeviceService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use OpenApi\Attributes as OA;

#[OA\PathItem(
    path: "/device"
)]
class DeviceController extends Controller
{
    public function __construct(protected DeviceService $service) {
    }

    /**
     * Display a listing of the resource.
     */
    #[OA\Get(
        path: "/api/Device",
        summary: "Get paginated list of Device",
        tags: ["Device"],
        description: "Retrieve a paginated list of Device with optional search",
        operationId:"getDevicePaginated",
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
        content: new OA\JsonContent(ref: "#/components/schemas/PaginatedDeviceResponse200")
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
        path: "/api/Device/{id}",
        summary: "Get a specific Device",
        tags: ["Device"],
        description: "Retrieve a Device by its ID",
        operationId: "getDeviceById",
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
        content: new OA\JsonContent(ref: "#/components/schemas/GetDeviceResponse200")
    )]
    #[OA\Response(
        response: 404,
        description: "Device not found"
    )]
    public function show($id)
    {
        try {
            return $this->ok($this->service->get($id));
        } catch (ModelNotFoundException $e) {
            return $this->notFound('Device not found');
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    #[OA\Post(
        path: "/api/Device",
        summary: "Create a new Device",
        tags: ["Device"],
        description:" Create a new Device with the provided details",
        operationId: "createDevice",
    )]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(ref: "#/components/schemas/Device")
    )]
    #[OA\Response(
        response: 200,
        description: "Device created successfully",
        content: new OA\JsonContent(ref: "#/components/schemas/CreateDeviceResponse200")
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
                'device_identifier' => ['required', 'string', 'max:255', 'unique:devices,device_identifier'],
                'car_rental_id' => ['required', 'integer', 'exists:car_rentals,id'],
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
        path: "/api/Device/{id}",
        summary: "Update a Device",
        tags: ["Device"],
        description: "Update an existing Device with the provided details",
        operationId: "updateDevice",
    )]
    #[OA\Parameter(
        name: "id",
        in: "path",
        required: true,
        schema: new OA\Schema(type: "integer"),
    )]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(ref: "#/components/schemas/Device")
    )]
    #[OA\Response(
        response: 200,
        description: "Device updated successfully",
        content: new OA\JsonContent(ref: "#/components/schemas/UpdateDeviceResponse200")
    )]
    #[OA\Response(
        response: 404,
        description: "Device not found"
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
                'device_identifier' => ['required', 'string', 'max:255', 'unique:devices,device_identifier,' . $id],
                'car_rental_id' => ['required', 'integer', 'exists:car_rentals,id'],
            ]);

            if ($validator->fails()) {
                return $this->validationError($validator->errors());
            }

            $validated = $validator->validated();

            return $this->ok($this->service->update($id, $validated));
        } catch (ModelNotFoundException $e) {
            return $this->notFound('Device not found');
        } catch (\Exception $e) {
            return $this->internalServerError($e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    #[OA\Delete(
        path: "/api/Device/{id}",
        summary: "Delete a Device",
        tags: ["Device"],
        description: "Delete a Device by its ID",
        operationId: "deleteDevice",
    )]
    #[OA\Parameter(
        name: "id",
        in: "path",
        required: true,
        schema: new OA\Schema(type: "integer")
    )]
    #[OA\Response(
        response: 204,
        description: "Device deleted successfully",
        content: new OA\JsonContent(ref: "#/components/schemas/DeleteDeviceResponse200")
    )]
    #[OA\Response(
        response: 404,
        description: "Device not found"
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
            return $this->notFound('Device not found');
        } catch (\Exception $e) {
            return $this->internalServerError($e->getMessage());
        }
    }
}
