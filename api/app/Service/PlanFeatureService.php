<?php

namespace App\Service;

use App\Interface\Repository\IPlanFeatureRepo;
use App\Interface\Service\IPlanFeatureService;

class PlanFeatureService extends GenericService implements IPlanFeatureService
{
    public function __construct(IPlanFeatureRepo $repo)
    {
        parent::__construct($repo);
    }
}