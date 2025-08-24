<?php

namespace App\Repository;

use App\Interface\Repository\IPlanFeatureRepo;
use App\Models\PlanFeature;
use App\Repository\GenericRepo;

class PlanFeatureRepo extends GenericRepo implements IPlanFeatureRepo
{
    public function __construct()
    {
        parent::__construct(PlanFeature::class);
    }
}