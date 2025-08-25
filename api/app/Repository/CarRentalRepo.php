<?php

namespace App\Repository;

use App\Interface\Repository\ICarRentalRepo;
use App\Models\CarRental;
use App\Repository\GenericRepo;

class CarRentalRepo extends GenericRepo implements ICarRentalRepo
{
    public function __construct()
    {
        parent::__construct(CarRental::class);
    }
}
