<?php

namespace App\Repository;

use App\Interface\Repository\IUserCompanyRepo;
use App\Models\UserCompany;
use App\Repository\GenericRepo;

class UserCompanyRepo extends GenericRepo implements IUserCompanyRepo
{
    public function __construct()
    {
        parent::__construct(UserCompany::class);
    }
}