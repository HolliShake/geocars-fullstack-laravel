<?php

namespace App\Repository;

use App\Interface\Repository\IUserSubscriptionRepo;
use App\Models\UserSubscription;

class UserSubscriptionRepo extends GenericRepo implements IUserSubscriptionRepo
{
    public function __construct()
    {
        parent::__construct(UserSubscription::class);
    }
}
