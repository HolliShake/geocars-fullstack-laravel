<?php

namespace App\Service;

use App\Interface\Repository\IRequirementRepo;
use App\Interface\Service\IRequirementService;
use App\Service\GenericService;

class RequirementService extends GenericService implements IRequirementService
{
    public function __construct(IRequirementRepo $repo)
    {
        parent::__construct($repo);
    }
}
