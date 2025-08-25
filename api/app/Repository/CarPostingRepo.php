<?php

namespace App\Repository;

use App\Interface\Repository\ICarPostingRepo;
use App\Models\CarPosting;
use App\Repository\GenericRepo;

class CarPostingRepo extends GenericRepo implements ICarPostingRepo
{
    public function __construct()
    {
        parent::__construct(CarPosting::class);
    }
}
