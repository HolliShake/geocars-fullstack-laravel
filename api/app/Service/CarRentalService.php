<?php

namespace App\Service;

use App\Interface\Repository\ICarRentalRepo;
use App\Interface\Service\ICarRentalService;

class CarRentalService extends GenericService implements ICarRentalService
{
    public function __construct(ICarRentalRepo $repo)
    {
        parent::__construct($repo);
    }
}
