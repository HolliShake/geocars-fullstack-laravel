<?php

namespace App\Service;

use App\Interface\Repository\ICommentRepo;
use App\Interface\Service\ICommentService;

class CommentService extends GenericService implements ICommentService
{
    public function __construct(ICommentRepo $repo)
    {
        parent::__construct($repo);
    }
}
