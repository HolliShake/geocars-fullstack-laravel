<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: "Comment",
    title: "Comment",
    type: "object",
    required: [
        "id",
        "content",
        "user_id",
        "car_posting_id",
        "created_at",
        "updated_at"
    ],
    properties: [
        new OA\Property(property: "id", type: "integer", example: 1),
        new OA\Property(property: "comment", type: "string", example: "This is a comment"),
        new OA\Property(property: "user_id", type: "integer", example: 1),
        new OA\Property(property: "car_posting_id", type: "integer", example: 1),
        new OA\Property(property: "parent_comment_id", type: "integer", nullable: true, example: null),
        new OA\Property(property: "created_at", type: "string", format: "date-time", example: "2024-01-01T00:00:00.000000Z"),
        new OA\Property(property: "updated_at", type: "string", format: "date-time", example: "2024-01-01T00:00:00.000000Z"),
        // User
        new OA\Property(property: "user", ref: "#/components/schemas/User", nullable: true, example: null),
        // Is current user
        new OA\Property(property: "is_current_user", type: "boolean", example: true),
        // Comment replies
        new OA\Property(property: "replies", type: "array", items: new OA\Items(ref: "#/components/schemas/Comment"), nullable: true, example: null),
    ]
)]

#[OA\Schema(
    schema: "PaginatedComment",
    title:"PaginatedComment",
    type: "object",
    properties: [
        new OA\Property(property: "data", type: "array", items: new OA\Items(ref: "#/components/schemas/Comment")),
        new OA\Property(property: "current_page", type: "integer"),
        new OA\Property(property: "last_page", type: "integer"),
        new OA\Property(property: "per_page", type: "integer"),
        new OA\Property(property: "total", type: "integer"),
        new OA\Property(property: "from", type: "integer", nullable: true),
        new OA\Property(property: "to", type: "integer", nullable: true),
    ]
)]

#[OA\Schema(
    schema: "PaginatedCommentResponse200",
    type: "object",
    properties: [
        new OA\Property(property: "success", type: "boolean", example: true),
        new OA\Property(property: "data", ref: "#/components/schemas/PaginatedComment")
    ]
)]

#[OA\Schema(
    schema: "GetCommentResponse200",
    type: "object",
    properties: [
        new OA\Property(property: "success", type: "boolean", example: true),
        new OA\Property(property: "data", ref: "#/components/schemas/Comment")
    ]
)]

#[OA\Schema(
    schema: "CreateCommentResponse200",
    type: "object",
    properties: [
        new OA\Property(property: "success", type: "boolean", example: true),
        new OA\Property(property: "data", ref: "#/components/schemas/Comment")
    ]
)]

#[OA\Schema(
    schema: "UpdateCommentResponse200",
    type: "object",
    properties: [
        new OA\Property(property: "success", type: "boolean", example: true),
        new OA\Property(property: "data", ref: "#/components/schemas/Comment")
    ]
)]

#[OA\Schema(
    schema: "DeleteCommentResponse200",
    type: "object",
    properties: [
        new OA\Property(property: "success", type: "boolean", example: true)
    ]
)]

class Comment extends Model
{
    protected $table = 'comments';

    public $timestamps = true;

    protected $fillable = [
        'user_id',
        'car_posting_id',
        'parent_comment_id',
        'comment',
    ];

    protected $appends = [
        'is_current_user',
    ];

    /**
     * Get the if the current user is the owner of the comment.
     *
     * @return bool
     */
    public function getIsCurrentUserAttribute()
    {
        if (!Auth::check()) return false;
        return $this->user_id === Auth::id();
    }

    /**
     * Get the user that owns the comment.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    /**
     * Get the replies for the comment.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function replies()
    {
        return $this->hasMany(Comment::class, 'parent_comment_id', 'id');
    }
}
