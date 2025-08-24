<?php

namespace App\Enum;

enum FuelTypeEnum: string
{
    case PETROL   = 'petrol';
    case DIESEL   = 'diesel';
    case ELECTRIC = 'electric';
    case HYBRID   = 'hybrid';
    case OTHER    = 'other';
}
