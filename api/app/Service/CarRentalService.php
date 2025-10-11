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

    public function checkSubmission(int $user_id, int $posting_id): bool
    {
        return $this->repo->query()->where('user_id', $user_id)->where('car_posting_id', $posting_id)->exists();
    }
}
