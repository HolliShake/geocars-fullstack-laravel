<?php

namespace App\Service;

use App\Interface\Repository\ICarPostingRepo;
use App\Interface\Service\ICarPostingService;

class CarPostingService extends GenericService implements ICarPostingService
{
    public function __construct(ICarPostingRepo $repo)
    {
        parent::__construct($repo);
    }
}
