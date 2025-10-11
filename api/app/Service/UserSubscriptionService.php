<?php

use App\Interface\Repository\IUserSubscriptionRepo;
use App\Interface\Service\IUserSubscriptionService;
use App\Service\GenericService;

class UserSubscriptionService extends GenericService implements IUserSubscriptionService
{
    function __construct(IUserSubscriptionRepo $repo)
    {
        parent::__construct($repo);
    }
}
