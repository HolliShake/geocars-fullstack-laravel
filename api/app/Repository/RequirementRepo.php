<?php

namespace App\Repository;

use App\Interface\Repository\IRequirementRepo;
use App\Models\Requirement;
use App\Repository\GenericRepo;

class RequirementRepo extends GenericRepo implements IRequirementRepo
{
    public function __construct()
    {
        parent::__construct(Requirement::class);
    }
}
