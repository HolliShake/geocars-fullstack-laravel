<?php

namespace App\Repository;

use App\Interface\Repository\IDeviceRepo;
use App\Models\Device;
use App\Repository\GenericRepo;

class DeviceRepo extends GenericRepo implements IDeviceRepo
{
    public function __construct()
    {
        parent::__construct(Device::class);
    }
}
