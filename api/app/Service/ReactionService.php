<?php

namespace App\Service;

use App\Interface\Repository\IReactionRepo;
use App\Interface\Service\IReactionService;

class ReactionService extends GenericService implements IReactionService
{
    public function __construct(IReactionRepo $repo)
    {
        parent::__construct($repo);
    }
}
