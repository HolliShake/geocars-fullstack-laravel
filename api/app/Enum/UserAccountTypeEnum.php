<?php

namespace App\Enum;

enum UserAccountTypeEnum: string
{
    case GCASH = 'GCash';
    case MAYA  = 'Maya';
    case BANK  = 'Bank';
}
