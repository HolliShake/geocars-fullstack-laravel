<?php

namespace App\Enum;

enum CarTypeEnum: string
{
    case SEDAN       = 'sedan';
    case HATCHBACK   = 'hatchback';
    case SUV         = 'suv';
    case MPV         = 'mpv';
    case COUPE       = 'coupe';
    case CONVERTIBLE = 'convertible';
    case OTHER       = 'other';
}
