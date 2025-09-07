<?php

namespace App\Interface\Service;

use App\Interface\Service\IGenericService;
use Illuminate\Database\Eloquent\Collection;

interface IUserRequirementService extends IGenericService
{
    /**
     * Get the user requirements
     *
     * @param int $userId The user ID
     * @param string $role The role
     * @return Collection<UserRequirement>
     */
    public function getUserRequirements(int $userId, string $role): Collection;
}
