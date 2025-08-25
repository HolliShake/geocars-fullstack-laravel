import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Car } from '@rest/models/car';
import { Calendar, Fuel, Gauge, LucideCog, Palette, Settings, Zap } from 'lucide-react';
import React from 'react';

type CarCardAction = {
  label: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'destructive' | 'outline' | 'ghost' | 'link' | 'secondary';
};

type CarCardProps = {
  car: Car;
  imageUrl: string;
  onClick?: (car: Car) => void;
  actions?: CarCardAction[];
};

const CarCard: React.FC<CarCardProps> = ({ car, imageUrl, onClick, actions = [] }) => {
  const formatEngineInfo = () => {
    const parts = [];
    if (car.engine_capacity) parts.push(`${car.engine_capacity}`);
    if (car.engine_power) parts.push(`${car.engine_power}hp`);
    return parts.join(' • ');
  };

  return (
    <Card
      className="select-none group overflow-hidden border-border hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-[1.01] bg-card/50 backdrop-blur-sm p-0"
      onClick={() => onClick?.(car)}
    >
      {/* Image Section */}
      <div className="relative aspect-[16/9] overflow-hidden">
        <img
          src={imageUrl}
          alt={`${car.brand} ${car.model}`}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

        <Badge
          variant="outline"
          className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm border-border/50"
        >
          {car.type}
        </Badge>

        <div className="absolute top-2 right-2">
          <Badge
            variant="outline"
            className={cn(
              'bg-background/80 backdrop-blur-sm border-border/50',
              car.is_available ? 'text-emerald-500' : 'text-destructive'
            )}
          >
            {car.is_available ? 'Available' : 'Unavailable'}
          </Badge>
        </div>
      </div>

      <CardHeader className="p-3 pb-0 space-y-1.5">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-medium leading-tight bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent group-hover:from-cyan-500 group-hover:via-blue-500 group-hover:to-purple-500 transition-all duration-300">
            {car.brand} {car.model}
          </h3>
          {car.year && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{car.year}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Palette className="h-3 w-3" />
          <span className="capitalize">
            <span
              className="inline-block w-2.5 h-2.5 rounded-full mr-1.5 ring-1 ring-white/10"
              style={{ backgroundColor: car.color.toLowerCase() }}
            ></span>
            {car.color}
          </span>
          <span className="font-mono bg-muted/50 px-1.5 py-0.5 rounded-md ml-auto backdrop-blur-sm">
            {car.plate_number}
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-3 space-y-2">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1.5 bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-purple-500/5 p-1.5 rounded-md backdrop-blur-sm">
            <Fuel className="h-3.5 w-3.5 text-primary" />
            <span className="capitalize">{car.fuel_type}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-purple-500/5 p-1.5 rounded-md backdrop-blur-sm">
            <Settings className="h-3.5 w-3.5 text-primary" />
            <span className="capitalize">{car.transmission}</span>
          </div>
        </div>

        {(car.engine_capacity || car.engine_power) && (
          <div className="flex items-center gap-1.5 text-xs bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-purple-500/5 p-1.5 rounded-md backdrop-blur-sm">
            <Zap className="h-3.5 w-3.5 text-primary" />
            <span>{formatEngineInfo()}</span>
          </div>
        )}

        {car.engine_torque && (
          <div className="flex items-center gap-1.5 text-xs bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-purple-500/5 p-1.5 rounded-md backdrop-blur-sm">
            <Gauge className="h-3.5 w-3.5 text-primary" />
            <span>{car.engine_torque}</span>
          </div>
        )}

        {car.engine_type && (
          <div className="flex items-center gap-1.5 text-xs bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-purple-500/5 p-1.5 rounded-md backdrop-blur-sm">
            <LucideCog className="h-3.5 w-3.5 text-primary" />
            <span>{car.engine_type}</span>
          </div>
        )}

        {actions.length > 0 && (
          <div className="flex items-center justify-end gap-2 mt-3">
            {actions.map((action, index) => (
              <Button
                key={`action-${index}`}
                variant={action.variant ?? 'default'}
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  action.onClick();
                }}
                className="relative overflow-hidden transition-all duration-300 hover:shadow-md hover:scale-105"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 opacity-0 hover:opacity-30 dark:hover:opacity-20 transition-opacity" />
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CarCard;
