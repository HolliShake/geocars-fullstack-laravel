<?php

namespace App\Http\Controllers;

use App\Service\CommentService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use OpenApi\Attributes as OA;

#[OA\PathItem(
    path: "/plans"
)]
class CommentController extends Controller
{
    public function __construct(protected CommentService $service) {
    }

    /**
     * Display a listing of the resource.
     */
    #[OA\Get(
        path: "/api/Comment",
        summary: "Get paginated list of Comment",
        tags: ["Comment"],
        description: "Retrieve a paginated list of Comment with optional search",
        operationId:"getCommentPaginated",
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
        content: new OA\JsonContent(ref: "#/components/schemas/PaginatedCommentResponse200")
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
        path: "/api/Comment/{id}",
        summary: "Get a specific Comment",
        tags: ["Comment"],
        description: "Retrieve a Comment by its ID",
        operationId: "getCommentById",
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
        content: new OA\JsonContent(ref: "#/components/schemas/GetCommentResponse200")
    )]
    #[OA\Response(
        response: 404,
        description: "Comment not found"
    )]
    public function show($id)
    {
        try {
            return $this->ok($this->service->get($id));
        } catch (ModelNotFoundException $e) {
            return $this->notFound('Comment not found');
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    #[OA\Post(
        path: "/api/Comment",
        summary: "Create a new Comment",
        tags: ["Comment"],
        description:" Create a new Comment with the provided details",
        operationId: "createComment",
    )]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(ref: "#/components/schemas/Comment")
    )]
    #[OA\Response(
        response: 200,
        description: "Comment created successfully",
        content: new OA\JsonContent(ref: "#/components/schemas/CreateCommentResponse200")
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
                'comment'           => 'required|string',
                'car_posting_id'    => 'required|integer|exists:car_postings,id',
                'user_id'           => 'required|integer|exists:users,id',
                'parent_comment_id' => 'nullable|integer|exists:comments,id',
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
        path: "/api/Comment/{id}",
        summary: "Update a Comment",
        tags: ["Comment"],
        description: "Update an existing Comment with the provided details",
        operationId: "updateComment",
    )]
    #[OA\Parameter(
        name: "id",
        in: "path",
        required: true,
        schema: new OA\Schema(type: "integer"),
    )]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(ref: "#/components/schemas/Comment")
    )]
    #[OA\Response(
        response: 200,
        description: "Comment updated successfully",
        content: new OA\JsonContent(ref: "#/components/schemas/UpdateCommentResponse200")
    )]
    #[OA\Response(
        response: 404,
        description: "Comment not found"
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
                'comment'           => 'required|string',
                'car_posting_id'    => 'required|integer|exists:car_postings,id',
                'user_id'           => 'required|integer|exists:users,id',
                'parent_comment_id' => 'nullable|integer|exists:comments,id',
            ]);

            if ($validator->fails()) {
                return $this->validationError($validator->errors());
            }

            $validated = $validator->validated();

            return $this->ok($this->service->update($id, $validated));
        } catch (ModelNotFoundException $e) {
            return $this->notFound('Comment not found');
        } catch (\Exception $e) {
            return $this->internalServerError($e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    #[OA\Delete(
        path: "/api/Comment/{id}",
        summary: "Delete a Comment",
        tags: ["Comment"],
        description: "Delete a Comment by its ID",
        operationId: "deleteComment",
    )]
    #[OA\Parameter(
        name: "id",
        in: "path",
        required: true,
        schema: new OA\Schema(type: "integer")
    )]
    #[OA\Response(
        response: 204,
        description: "Comment deleted successfully",
        content: new OA\JsonContent(ref: "#/components/schemas/DeleteCommentResponse200")
    )]
    #[OA\Response(
        response: 404,
        description: "Comment not found"
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
            return $this->notFound('Comment not found');
        } catch (\Exception $e) {
            return $this->internalServerError($e->getMessage());
        }
    }
}
