<?php

namespace App\Enum;

enum RoleEnum: string
{
    case ADMIN  = 'admin';
    case USER   = 'user';
    case RENTER = 'renter';
}
