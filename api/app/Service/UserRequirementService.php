<?php

namespace App\Service;

use App\Interface\Repository\IUserRequirementRepo;
use App\Interface\Service\IUserRequirementService;
use App\Service\GenericService;

class UserRequirementService extends GenericService implements IUserRequirementService
{
    public function __construct(IUserRequirementRepo $repo)
    {
        parent::__construct($repo);
    }
}
