<?php

namespace App\Interface\Service;

use App\Interface\Service\IGenericService;

interface ICarRentalService extends IGenericService
{
    public function checkSubmission(int $user_id, int $posting_id): bool;
}
