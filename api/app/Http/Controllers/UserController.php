<?php

namespace App\Http\Controllers;

use App\Service\UserService;
use Http\Discovery\Exception\NotFoundException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use OpenApi\Attributes as OA;

class UserController extends Controller
{
    public function __construct(protected UserService $service) {
    }

    /**
     * Display a listing of the resource.
     */
    #[OA\Get(
        path: "/api/User",
        summary: "Get paginated list of User",
        tags: ["User"],
        description: "Retrieve a paginated list of User with optional search",
        operationId:"getUserPaginated",
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
        content: new OA\JsonContent(ref: "#/components/schemas/PaginatedUserResponse200")
    )]
    public function index(Request $request)
    {
        $srch = $request->query("search", '');
        $page = $request->query("page", 0);
        $rows = $request->query("rows", 10);
        return $this->ok($this->service->paginate($page, $rows, ['*'], [], conditions: [
            "email" => $srch ? ['like', "%{$srch}%"] : null,
        ]));
    }

    /**
     * Display the specified resource.
     */
    #[OA\Get(
        path: "/api/User/{id}",
        summary: "Get a specific User",
        tags: ["User"],
        description: "Retrieve a User by its ID",
        operationId: "getUserById",
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
        content: new OA\JsonContent(ref: "#/components/schemas/GetUserResponse200")
    )]
    #[OA\Response(
        response: 404,
        description: "User not found"
    )]
    public function show($id)
    {
        try {
            return $this->ok($this->service->get($id));
        } catch (ModelNotFoundException $e) {
            return $this->notFound('User not found');
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    #[OA\Post(
        path: "/api/User",
        summary: "Create a new User",
        tags: ["User"],
        description:" Create a new User with the provided details",
        operationId: "createUser",
    )]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(ref: "#/components/schemas/User")
    )]
    #[OA\Response(
        response: 200,
        description: "User created successfully",
        content: new OA\JsonContent(ref: "#/components/schemas/CreateUserResponse200")
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
                "firstname"   => "required|string|max:255",
                "lastname"    => "required|string|max:255",
                "email"       => "required|email|max:255|unique:users,email",
                "role"        => "required|in:admin,user,renter",
                "username"    => "required|string|max:255|unique:users,username",
                "phone"       => "nullable|string|max:20",
                "country"     => "nullable|string|max:100",
                "city"        => "nullable|string|max:100",
                "address"     => "nullable|string|max:255",
                "postal_code" => "nullable|string|max:20",
                "is_active"   => "required|boolean",
                "password"    => "sometimes|string|min:8|confirmed",
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
        path: "/api/User/{id}",
        summary: "Update a User",
        tags: ["User"],
        description: "Update an existing User with the provided details",
        operationId: "updateUser",
    )]
    #[OA\Parameter(
        name: "id",
        in: "path",
        required: true,
        schema: new OA\Schema(type: "integer"),
    )]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(ref: "#/components/schemas/User")
    )]
    #[OA\Response(
        response: 200,
        description: "User updated successfully",
        content: new OA\JsonContent(ref: "#/components/schemas/UpdateUserResponse200")
    )]
    #[OA\Response(
        response: 404,
        description: "User not found",
        content: new OA\JsonContent(ref: "#/components/schemas/NotFoundResponse")
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
            $user = Auth::user();
            $use_id = $id == 0 ? $user->id : $id; // Use current user's id if id is 0, otherwise use route parameter
            $validator = Validator::make($request->all(), [
                "firstname"   => "required|string|max:255",
                "lastname"    => "required|string|max:255",
                "email"       => "required|email|max:255|unique:users,email,$use_id",
                "role"        => "sometimes|in:admin,user,renter",
                "username"    => "required|string|max:255|unique:users,username,$use_id",
                "phone"       => "nullable|string|max:20",
                "country"     => "nullable|string|max:100",
                "city"        => "nullable|string|max:100",
                "address"     => "nullable|string|max:255",
                "postal_code" => "nullable|string|max:20",
                "is_active"   => "sometimes|boolean",
                "password"    => "nullable|string|min:8",
            ]);

            if ($validator->fails()) {
                return $this->validationError($validator->errors());
            }

            $validated = $validator->validated();

            return $this->ok($this->service->update($use_id, [...$validated, 'id' => $use_id]));
        } catch (ModelNotFoundException $e) {
            return $this->notFound('User not found');
        } catch (\Exception $e) {
            return $this->internalServerError($e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    #[OA\Delete(
        path: "/api/User/{id}",
        summary: "Delete a User",
        tags: ["User"],
        description: "Delete a User by its ID",
        operationId: "deleteUser",
    )]
    #[OA\Parameter(
        name: "id",
        in: "path",
        required: true,
        schema: new OA\Schema(type: "integer")
    )]
    #[OA\Response(
        response: 204,
        description: "User deleted successfully",
        content: new OA\JsonContent(ref: "#/components/schemas/DeleteUserResponse200")
    )]
    #[OA\Response(
        response: 404,
        description: "User not found",
        content: new OA\JsonContent(ref: "#/components/schemas/NotFoundResponse")
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
            return $this->notFound('User not found');
        } catch (\Exception $e) {
            return $this->internalServerError($e->getMessage());
        }
    }

    #[OA\Post(
        path: "/api/User/uploadProfilePicture/{id}",
        summary: "Upload a profile picture",
        tags: ["User"],
        description: "Upload a profile picture for the current user",
        operationId: "uploadProfilePicture",
    )]
    #[OA\Parameter(
        name: "id",
        in: "path",
        required: true,
        schema: new OA\Schema(type: "integer")
    )]

    #[OA\RequestBody(
        required: true,
        content: [
            new OA\MediaType(
                mediaType: "multipart/form-data",
                schema: new OA\Schema(
                    type: "object",
                    required: ["file"],
                    properties: [
                        new OA\Property(
                            property: "file",
                            type: "string",
                            format: "binary",
                            description: "Profile picture file"
                        )
                    ]
                )
            )
        ]
    )]
    #[OA\Response(
        response: 200,
        description: "Profile picture uploaded successfully",
        content: new OA\JsonContent(type: "string")
    )]
    #[OA\Response(
        response: 401,
        description: "Unauthorized",
        content: new OA\JsonContent(ref: "#/components/schemas/UnauthorizedResponse")
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
    public function uploadProfilePicture(Request $request, string $id)
    {
        $validator = Validator::make($request->all(), [
            'file' => 'required|file|image|mimes:jpeg,png,jpg,gif,svg,webp|max:2048',
        ]);

        if ($validator->fails()) {
            return $this->validationError($validator->errors());
        }

        try {
            if (!$request->hasFile('file')) {
                return $this->validationError(['file' => ['File is required']]);
            }

            $file = $request->file('file');
            if (!$file->isValid()) {
                return $this->validationError(['file' => ['Invalid file upload']]);
            }

            $user = $this->service->get($id);
            $user->clearMediaCollection('profile');
            $media = $user->addMediaFromRequest('file')
                ->toMediaCollection('profile');
            return $this->ok($media->getUrl());
        } catch (NotFoundException $e) {
            return $this->notFound($e->getMessage());
        } catch (\Exception $e) {
            return $this->internalServerError($e->getMessage());
        }
    }
}
