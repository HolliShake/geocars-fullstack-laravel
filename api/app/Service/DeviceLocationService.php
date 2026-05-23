<?php

namespace App\Service;

use App\Interface\Repository\IDeviceLocationRepo;
use App\Interface\Service\IDeviceLocationService;
use App\Service\GenericService;

class DeviceLocationService extends GenericService implements IDeviceLocationService
{
    public function __construct(IDeviceLocationRepo $repo)
    {
        parent::__construct($repo);
    }
}
