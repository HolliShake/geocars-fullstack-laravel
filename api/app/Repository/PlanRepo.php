<?php

namespace App\Repository;

use App\Interface\Repository\IPlanRepo;
use App\Models\Plan;
use App\Repository\GenericRepo;

class PlanRepo extends GenericRepo implements IPlanRepo
{
    public function __construct()
    {
        parent::__construct(Plan::class);
    }
}