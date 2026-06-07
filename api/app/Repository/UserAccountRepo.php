<?php

namespace App\Repository;

use App\Interface\Repository\IUserAccountRepo;
use App\Models\UserAccount;

class UserAccountRepo extends GenericRepo implements IUserAccountRepo
{
    public function __construct()
    {
        parent::__construct(UserAccount::class);
    }

    public function clearDefaultForUser(int $userId, ?int $exceptId = null): void
    {
        $query = $this->query()->where('user_id', $userId);

        if (!is_null($exceptId)) {
            $query->where('id', '!=', $exceptId);
        }

        $query->update(['is_default' => false]);
    }

    public function hasDefaultForUser(int $userId): bool
    {
        return $this->query()
            ->where('user_id', $userId)
            ->where('is_default', true)
            ->exists();
    }

    public function getUserIdByAccountId(int $id): ?int
    {
        return $this->query()
            ->where('id', $id)
            ->value('user_id');
    }
}
