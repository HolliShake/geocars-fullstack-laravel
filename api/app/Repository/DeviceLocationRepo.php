<?php

namespace App\Repository;

use App\Interface\Repository\IDeviceLocationRepo;
use App\Models\DeviceLocation;
use App\Repository\GenericRepo;

class DeviceLocationRepo extends GenericRepo implements IDeviceLocationRepo
{
    public function __construct()
    {
        parent::__construct(DeviceLocation::class);
    }
}
