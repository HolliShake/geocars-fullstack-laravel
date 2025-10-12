<?php

namespace App\Repository;

use App\Interface\Repository\IReactionRepo;
use App\Models\Reaction;
use App\Repository\GenericRepo;

class ReactionRepo extends GenericRepo implements IReactionRepo
{
    public function __construct()
    {
        parent::__construct(Reaction::class);
    }
}
