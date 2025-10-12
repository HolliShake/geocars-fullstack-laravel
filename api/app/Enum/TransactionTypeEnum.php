<?php

namespace App\Enum;

enum TransactionTypeEnum: string
{
    case PAYMENT = 'payment';
    case REFUND  = 'refund';
}
