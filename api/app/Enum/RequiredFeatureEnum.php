<?php

namespace App\Enum;

enum RequiredFeatureEnum: string
{
    case CARS              = 'Cars';
    case DASHBOARD         = 'Dashboard';
    case DASHBOARD_TIME    = 'Dashboard Time';
    case ANALYTICS_ENABLED = 'Analytics Enabled';
    case TRACKING_ENABLED  = 'Tracking Enabled';
    case TRACKING_HOUR     = 'Tracking Hour';
}

