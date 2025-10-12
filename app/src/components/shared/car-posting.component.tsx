import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { dumbCurrency } from '@/lib/dumb-currency';
import type { CarPosting } from '@rest/models/carPosting';
import {
  Building2,
  Calendar,
  CalendarDays,
  Clock,
  Fuel,
  Gauge,
  LucideCog,
  MessageSquare,
  Palette,
  Settings,
  Zap,
} from 'lucide-react';
import React from 'react';

interface CarPostingCardProps {
  imageUrl: string;
  carPosting: CarPosting;
  onClick: () => void;
  onViewComments?: () => void;
}

export const CarPostingCard: React.FC<CarPostingCardProps> = ({
  imageUrl,
  carPosting,
  onClick,
  onViewComments,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getDurationInDays = () => {
    const start = new Date(carPosting.start_date);
    const end = new Date(carPosting.end_date);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatEngineInfo = () => {
    const parts = [];
    if (carPosting.car?.engine_capacity) parts.push(`${carPosting.car.engine_capacity}`);
    if (carPosting.car?.engine_power) parts.push(`${carPosting.car.engine_power}hp`);
    return parts.join(' • ');
  };

  const handleViewComments = (e: React.MouseEvent) => {
    e.stopPropagation();
    onViewComments?.();
  };

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick?.();
  };

  return (
    <Card
      className="select-none relative overflow-hidden group hover:shadow-2xl transition-all duration-300 border-border/50 backdrop-blur-sm hover:scale-[1.01] p-0 cursor-pointer flex flex-col h-full"
      onClick={handleCardClick}
    >
      {/* Web3 Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Image Section */}
      <div className="relative aspect-[16/9] overflow-hidden">
        <img
          src={imageUrl}
          alt={`${carPosting.car?.brand} ${carPosting.car?.model}`}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

        {/* Car Type Badge */}
        <Badge
          variant="outline"
          className="absolute top-3 left-3 bg-background/80 backdrop-blur-sm border-border/50"
        >
          {carPosting.car?.type}
        </Badge>

        {/* Availability Badge */}
        <div className="absolute top-3 right-3">
          <Badge
            variant={carPosting.is_available ? 'default' : 'destructive'}
            className={`${
              carPosting.is_available
                ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-700 border-green-500/30'
                : 'bg-destructive/20 text-destructive border-destructive/30'
            } backdrop-blur-sm`}
          >
            {carPosting.is_available ? 'Available' : 'Booked'}
          </Badge>
        </div>
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl font-semibold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              {carPosting.car?.brand} {carPosting.car?.model}
            </CardTitle>
            <CardDescription className="flex items-center gap-2 text-muted-foreground">
              <Building2 className="w-4 h-4" />
              {carPosting.car?.user_company?.name || 'Private Owner'}
            </CardDescription>
          </div>
        </div>

        {/* Car Basic Info */}
        <div className="flex items-center justify-between mt-2">
          {carPosting.car?.year && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{carPosting.car.year}</span>
            </div>
          )}
          {carPosting.car?.plate_number && (
            <span className="font-mono bg-muted/50 px-1.5 py-0.5 rounded-md text-xs backdrop-blur-sm">
              {carPosting.car.plate_number}
            </span>
          )}
        </div>

        {/* Color and Availability */}
        {carPosting.car?.color && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Palette className="h-3 w-3" />
            <span className="capitalize">
              <span
                className="inline-block w-2.5 h-2.5 rounded-full mr-1.5 ring-1 ring-white/10"
                style={{ backgroundColor: carPosting.car.color.toLowerCase() }}
              ></span>
              {carPosting.car.color}
            </span>
            {/* confusion, atuomatically car is unavailable if has active posting! */}
            {/* {carPosting.car.is_available !== undefined && (
              <Badge
                variant="outline"
                className={cn(
                  'ml-auto bg-background/80 backdrop-blur-sm border-border/50',
                  carPosting.car.is_available ? 'text-emerald-500' : 'text-destructive'
                )}
              >
                {carPosting.car.is_available ? 'Car Available' : 'Car Unavailable'}
              </Badge>
            )} */}
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4 p-4 flex-1 flex flex-col">
        {/* Car Technical Details */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          {carPosting.car?.fuel_type && (
            <div className="flex items-center gap-1.5 bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-purple-500/5 p-1.5 rounded-md backdrop-blur-sm">
              <Fuel className="h-3.5 w-3.5 text-primary" />
              <span className="capitalize">{carPosting.car.fuel_type}</span>
            </div>
          )}
          {carPosting.car?.transmission && (
            <div className="flex items-center gap-1.5 bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-purple-500/5 p-1.5 rounded-md backdrop-blur-sm">
              <Settings className="h-3.5 w-3.5 text-primary" />
              <span className="capitalize">{carPosting.car.transmission}</span>
            </div>
          )}
        </div>

        {/* Engine Information */}
        {(carPosting.car?.engine_capacity || carPosting.car?.engine_power) && (
          <div className="flex items-center gap-1.5 text-xs bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-purple-500/5 p-1.5 rounded-md backdrop-blur-sm">
            <Zap className="h-3.5 w-3.5 text-primary" />
            <span>{formatEngineInfo()}</span>
          </div>
        )}

        {carPosting.car?.engine_torque && (
          <div className="flex items-center gap-1.5 text-xs bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-purple-500/5 p-1.5 rounded-md backdrop-blur-sm">
            <Gauge className="h-3.5 w-3.5 text-primary" />
            <span>{carPosting.car.engine_torque}</span>
          </div>
        )}

        {carPosting.car?.engine_type && (
          <div className="flex items-center gap-1.5 text-xs bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-purple-500/5 p-1.5 rounded-md backdrop-blur-sm">
            <LucideCog className="h-3.5 w-3.5 text-primary" />
            <span>{carPosting.car.engine_type}</span>
          </div>
        )}

        {/* Date Range */}
        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 backdrop-blur-sm">
          <CalendarDays className="w-4 h-4 text-blue-500" />
          <div className="flex-1">
            <div className="text-sm font-medium">
              {formatDate(carPosting.start_date)} - {formatDate(carPosting.end_date)}
            </div>
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {getDurationInDays()} day{getDurationInDays() > 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* Description - Fixed height with line clamp */}
        <div className="h-10 overflow-hidden">
          {carPosting.description && (
            <div
              className="text-sm text-muted-foreground line-clamp-2 prose prose-sm max-w-none [&>*]:text-muted-foreground [&>p]:m-0 [&>ul]:m-0 [&>ol]:m-0 [&>h1]:text-sm [&>h2]:text-sm [&>h3]:text-sm [&>h4]:text-sm [&>h5]:text-sm [&>h6]:text-sm"
              dangerouslySetInnerHTML={{ __html: carPosting.description }}
            />
          )}
        </div>

        {/* Spacer to push price and button to bottom */}
        <div className="flex-1" />

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
            {dumbCurrency(carPosting.price)}
          </span>
          <span className="text-sm text-muted-foreground">/ day</span>
        </div>

        {/* View Comments Button */}
        {onViewComments && (
          <Button
            variant="outline"
            size="sm"
            className="w-full bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-purple-500/5 hover:from-cyan-500/10 hover:via-blue-500/10 hover:to-purple-500/10 border-border/50 relative z-10"
            onClick={handleViewComments}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            View Comments
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
