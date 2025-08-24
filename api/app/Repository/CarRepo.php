<?php

namespace App\Repository;

use App\Interface\Repository\ICarRepo;
use App\Models\Car;
use App\Repository\GenericRepo;

class CarRepo extends GenericRepo implements ICarRepo
{
    public function __construct()
    {
        parent::__construct(Car::class);
    }
}