<?php

namespace App\Enum;

enum ReactionEnum: string
{
    case LIKE    = 'like';
    case DISLIKE = 'dislike';
    case LOVE    = 'love';
    case HAHA    = 'haha';
    case WOW     = 'wow';
    case SAD     = 'sad';
}
