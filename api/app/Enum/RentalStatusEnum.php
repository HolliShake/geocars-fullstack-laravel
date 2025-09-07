<?php

namespace App\Enum;

enum RentalStatusEnum: string
{
    case PENDING   = 'pending';
    case CONFIRMED = 'confirmed';
    case CANCELLED = 'cancelled';
    case COMPLETED = 'completed';
    case REJECTED  = 'rejected';
}
