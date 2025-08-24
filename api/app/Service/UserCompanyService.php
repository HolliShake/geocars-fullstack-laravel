<?php

namespace App\Service;

use App\Interface\Repository\IPlanRepo;
use App\Interface\Repository\IUserCompanyRepo;
use App\Interface\Service\IUserCompanyService;

class UserCompanyService extends GenericService implements IUserCompanyService
{
    public function __construct(IUserCompanyRepo $repo)
    {
        parent::__construct($repo);
    }
}