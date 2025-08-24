<?php

namespace App\Service;

use App\Interface\Repository\IPlanRepo;
use App\Interface\Service\IPlanService;

class PlanService extends GenericService implements IPlanService
{
    public function __construct(IPlanRepo $repo)
    {
        parent::__construct($repo);
    }
}