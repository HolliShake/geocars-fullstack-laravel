<?php

namespace App\Enum;

enum TransactionTypeEnum: string
{
    case PAYMENT = 'payment';
    case RENEWAL = 'renewal';
    case REFUND  = 'refund';
}
