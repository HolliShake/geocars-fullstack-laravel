<?php

namespace App\Enum;

enum PaymentMethodEnum: string
{
    case CASH   = 'cash';
    case ONLINE = 'online';
}
