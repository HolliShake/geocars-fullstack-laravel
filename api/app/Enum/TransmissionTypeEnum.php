<?php

namespace App\Enum;

enum TransmissionTypeEnum: string
{
    case MANUAL    = 'manual';
    case AUTOMATIC = 'automatic';
    case OTHER     = 'other';
}
