<?php

namespace App\Repository;

use App\Interface\Repository\IUserRequirementRepo;
use App\Models\UserRequirement;

class UserRequirementRepo extends GenericRepo implements IUserRequirementRepo
{
    public function __construct()
    {
        parent::__construct(UserRequirement::class);
    }
}
