<?php

namespace App\Service;

use App\Interface\Repository\IUserAccountRepo;
use App\Interface\Service\IUserAccountService;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class UserAccountService extends GenericService implements IUserAccountService
{
    public function __construct(protected IUserAccountRepo $userAccountRepo)
    {
        parent::__construct($userAccountRepo);
    }

    public function create(array $data): ?Model
    {
        return DB::transaction(function () use ($data) {
            $isDefault = (bool) ($data['is_default'] ?? false);

            if ($isDefault) {
                $this->userAccountRepo->clearDefaultForUser($data['user_id']);
            } elseif (!$this->userAccountRepo->hasDefaultForUser($data['user_id'])) {
                $data['is_default'] = true;
            }

            return parent::create($data);
        });
    }

    public function update(int $id, array $data): Model
    {
        return DB::transaction(function () use ($id, $data) {
            $accountUserId = $this->userAccountRepo->getUserIdByAccountId($id);
            $targetUserId = $accountUserId ?? (int) ($data['user_id'] ?? 0);

            if ((bool) ($data['is_default'] ?? false)) {
                $this->userAccountRepo->clearDefaultForUser($targetUserId, $id);
            }

            $updated = parent::update($id, $data);

            if (!$this->userAccountRepo->hasDefaultForUser($targetUserId)) {
                $updated = parent::update($id, ['is_default' => true]);
            }

            return $updated;
        });
    }
}
