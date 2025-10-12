<?php

namespace App\Repository;

use App\Interface\Repository\ICommentRepo;
use App\Models\Comment;
use App\Repository\GenericRepo;

class CommentRepo extends GenericRepo implements ICommentRepo
{
    public function __construct()
    {
        parent::__construct(Comment::class);
    }
}
