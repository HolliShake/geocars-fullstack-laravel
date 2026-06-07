<?php

namespace App\Interface\Repository;

interface IUserAccountRepo extends IGenericRepo
{
    public function clearDefaultForUser(int $userId, ?int $exceptId = null): void;

    public function hasDefaultForUser(int $userId): bool;

    public function getUserIdByAccountId(int $id): ?int;
}
