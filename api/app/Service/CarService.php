<?php

namespace App\Service;

use App\Interface\Repository\ICarRepo;
use App\Interface\Service\ICarService;

class CarService extends GenericService implements ICarService
{
    public function __construct(ICarRepo $repo)
    {
        parent::__construct($repo);
    }
}