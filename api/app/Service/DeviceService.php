<?php

namespace App\Service;

use App\Interface\Repository\IDeviceRepo;
use App\Interface\Service\IDeviceService;
use App\Service\GenericService;

class DeviceService extends GenericService implements IDeviceService
{
    public function __construct(IDeviceRepo $repo)
    {
        parent::__construct($repo);
    }
}
