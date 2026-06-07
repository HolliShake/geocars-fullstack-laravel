<?php

namespace App\Http\Controllers;

use App\Enum\UserAccountTypeEnum;
use App\Service\UserAccountService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use OpenApi\Attributes as OA;

class UserAccountController extends Controller
{
    public function __construct(protected UserAccountService $service)
    {
    }

    #[OA\Get(
        path: "/api/UserAccount",
        summary: "Get paginated list of UserAccount",
        tags: ["UserAccount"],
        description: "Retrieve a paginated list of UserAccount with optional search",
        operationId: "getUserAccountPaginated",
    )]
    #[OA\Parameter(
        name: "search",
        in: "query",
        description: "Search term for account number",
        required: false,
        schema: new OA\Schema(type: "string"),
    )]
    #[OA\Parameter(
        name: "type",
        in: "query",
        description: "Filter by account type",
        required: false,
        schema: new OA\Schema(type: "string", enum: ["GCash", "Maya", "Bank"]),
    )]
    #[OA\Parameter(
        name: "page",
        in: "query",
        description: "Page number",
        required: false,
        schema: new OA\Schema(type: "integer", default: 1),
    )]
    #[OA\Parameter(
        name: "rows",
        in: "query",
        description: "Number of items per page",
        required: false,
        schema: new OA\Schema(type: "integer", default: 10),
    )]
    #[OA\Parameter(
        name: "current_user",
        in: "query",
        description: "When true, only return accounts for authenticated user",
        required: false,
        schema: new OA\Schema(type: "boolean", default: true),
    )]
    #[OA\Response(
        response: 200,
        description: "Successful operation",
        content: new OA\JsonContent(ref: "#/components/schemas/PaginatedUserAccountResponse200"),
    )]
    public function index(Request $request)
    {
        try {
            $srch = $request->query('search', '');
            $type = $request->query('type');
            $page = (int) $request->query('page', 1);
            $rows = (int) $request->query('rows', 10);
            $currentUser = filter_var($request->query('current_user', true), FILTER_VALIDATE_BOOL);

            $conditions = [
                'account_number' => $srch ? ['like', "%{$srch}%"] : null,
                'type' => $type ? ['=', $type] : null,
            ];

            if ($currentUser) {
                $conditions['user_id'] = ['=', Auth::user()->id];
            }

            return $this->ok($this->service->paginate($page, $rows, ['*'], ['owner'], $conditions));
        } catch (\Exception $e) {
            return $this->internalServerError($e->getMessage());
        }
    }

    #[OA\Get(
        path: "/api/UserAccount/{id}",
        summary: "Get a specific UserAccount",
        tags: ["UserAccount"],
        description: "Retrieve a UserAccount by its ID",
        operationId: "getUserAccountById",
    )]
    #[OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "integer"))]
    #[OA\Response(
        response: 200,
        description: "Successful operation",
        content: new OA\JsonContent(ref: "#/components/schemas/GetUserAccountResponse200"),
    )]
    #[OA\Response(response: 404, description: "UserAccount not found")]
    public function show(int $id)
    {
        try {
            $user = Auth::user();
            $account = $this->service->get($id, ['*'], ['owner']);

            if ($user->role !== 'admin' && $account->user_id !== $user->id) {
                return $this->forbidden('You do not have access to this account.');
            }

            return $this->ok($account);
        } catch (ModelNotFoundException $e) {
            return $this->notFound('UserAccount not found');
        } catch (\Exception $e) {
            return $this->internalServerError($e->getMessage());
        }
    }

    #[OA\Post(
        path: "/api/UserAccount",
        summary: "Create a new UserAccount",
        tags: ["UserAccount"],
        description: "Create a new bank or e-wallet account",
        operationId: "createUserAccount",
    )]
    #[OA\RequestBody(required: true, content: new OA\JsonContent(ref: "#/components/schemas/UserAccount"))]
    #[OA\Response(
        response: 200,
        description: "UserAccount created successfully",
        content: new OA\JsonContent(ref: "#/components/schemas/CreateUserAccountResponse200"),
    )]
    #[OA\Response(
        response: 422,
        description: "Validation error",
        content: new OA\JsonContent(ref: "#/components/schemas/ValidationErrorResponse"),
    )]
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'user_id' => 'required|integer|exists:users,id',
                'type' => ['required', Rule::in(array_column(UserAccountTypeEnum::cases(), 'value'))],
                'account_number' => 'required|string|max:255',
                'is_default' => 'sometimes|boolean',
            ]);

            if ($validator->fails()) {
                return $this->validationError($validator->errors());
            }

            $validated = $validator->validated();
            $user = Auth::user();

            if ($user->role !== 'admin') {
                $validated['user_id'] = $user->id;
            }

            $validated['is_default'] = (bool) ($validated['is_default'] ?? false);

            return $this->ok($this->service->create($validated));
        } catch (\Exception $e) {
            return $this->internalServerError($e->getMessage());
        }
    }

    #[OA\Put(
        path: "/api/UserAccount/{id}",
        summary: "Update a UserAccount",
        tags: ["UserAccount"],
        description: "Update an existing bank or e-wallet account",
        operationId: "updateUserAccount",
    )]
    #[OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "integer"))]
    #[OA\RequestBody(required: true, content: new OA\JsonContent(ref: "#/components/schemas/UserAccount"))]
    #[OA\Response(
        response: 200,
        description: "UserAccount updated successfully",
        content: new OA\JsonContent(ref: "#/components/schemas/UpdateUserAccountResponse200"),
    )]
    #[OA\Response(response: 404, description: "UserAccount not found")]
    #[OA\Response(
        response: 422,
        description: "Validation error",
        content: new OA\JsonContent(ref: "#/components/schemas/ValidationErrorResponse"),
    )]
    public function update(Request $request, int $id)
    {
        try {
            $account = $this->service->get($id);
            $user = Auth::user();

            if ($user->role !== 'admin' && $account->user_id !== $user->id) {
                return $this->forbidden('You do not have access to this account.');
            }

            $validator = Validator::make($request->all(), [
                'user_id' => 'required|integer|exists:users,id',
                'type' => ['required', Rule::in(array_column(UserAccountTypeEnum::cases(), 'value'))],
                'account_number' => 'required|string|max:255',
                'is_default' => 'sometimes|boolean',
            ]);

            if ($validator->fails()) {
                return $this->validationError($validator->errors());
            }

            $validated = $validator->validated();

            if ($user->role !== 'admin') {
                $validated['user_id'] = $user->id;
            }

            $validated['is_default'] = (bool) ($validated['is_default'] ?? false);

            return $this->ok($this->service->update($id, $validated));
        } catch (ModelNotFoundException $e) {
            return $this->notFound('UserAccount not found');
        } catch (\Exception $e) {
            return $this->internalServerError($e->getMessage());
        }
    }

    #[OA\Delete(
        path: "/api/UserAccount/{id}",
        summary: "Delete a UserAccount",
        tags: ["UserAccount"],
        description: "Delete a UserAccount by ID",
        operationId: "deleteUserAccount",
    )]
    #[OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "integer"))]
    #[OA\Response(
        response: 204,
        description: "UserAccount deleted successfully",
        content: new OA\JsonContent(ref: "#/components/schemas/DeleteUserAccountResponse200"),
    )]
    #[OA\Response(response: 404, description: "UserAccount not found")]
    public function destroy(int $id)
    {
        try {
            $account = $this->service->get($id);
            $user = Auth::user();

            if ($user->role !== 'admin' && $account->user_id !== $user->id) {
                return $this->forbidden('You do not have access to this account.');
            }

            $this->service->delete($id);
            return $this->noContent();
        } catch (ModelNotFoundException $e) {
            return $this->notFound('UserAccount not found');
        } catch (\Exception $e) {
            return $this->internalServerError($e->getMessage());
        }
    }
}
