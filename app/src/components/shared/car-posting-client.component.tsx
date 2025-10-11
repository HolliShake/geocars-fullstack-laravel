import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { dumbCurrency } from '@/lib/dumb-currency';
import type { CarPosting } from '@rest/models/carPosting';
import { Calendar, CalendarDays, Fuel, MessageCircle, Settings, ThumbsUp, Zap } from 'lucide-react';
import React, { useState } from 'react';

interface CarPostingCardProps {
  imageUrl: string;
  carPosting: CarPosting;
  onClick: () => void;
}

export const CarPostingCard: React.FC<CarPostingCardProps> = ({
  imageUrl,
  carPosting,
  onClick,
}) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(Math.floor(Math.random() * 50) + 10);
  const [commentCount] = useState(Math.floor(Math.random() * 20) + 3);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getDurationInDays = () => {
    const start = new Date(carPosting.start_date);
    const end = new Date(carPosting.end_date);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLiked(!liked);
    setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
  };

  const handleComment = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <Card
      className="select-none overflow-hidden group hover:shadow-lg transition-all duration-300 cursor-pointer"
      onClick={onClick}
    >
      {/* Header */}
      <CardHeader className="pb-2 pt-3 px-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-purple-400 flex items-center justify-center text-white text-xs font-semibold">
            {carPosting.car?.user_company?.name?.[0] || 'P'}
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-xs font-semibold truncate">
              {carPosting.car?.user_company?.name || 'Private Owner'}
            </CardTitle>
            <CardDescription className="text-[10px]">
              {formatDate(carPosting.created_at || new Date().toISOString())}
            </CardDescription>
          </div>
          <Badge
            variant={carPosting.is_available ? 'default' : 'destructive'}
            className="text-[10px] px-1.5 py-0"
          >
            {carPosting.is_available ? 'Available' : 'Booked'}
          </Badge>
        </div>
      </CardHeader>

      {/* Image */}
      <div className="relative aspect-video overflow-hidden">
        <img
          src={imageUrl}
          alt={`${carPosting.car?.brand} ${carPosting.car?.model}`}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      <CardContent className="space-y-2 p-3">
        {/* Title & Basic Info */}
        <div>
          <h3 className="text-base font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent truncate">
            {carPosting.car?.brand} {carPosting.car?.model}
          </h3>
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
            {carPosting.car?.year && (
              <span className="flex items-center gap-0.5">
                <Calendar className="h-2.5 w-2.5" />
                {carPosting.car.year}
              </span>
            )}
            {carPosting.car?.type && <span>• {carPosting.car.type}</span>}
            {carPosting.car?.plate_number && (
              <span className="font-mono">• {carPosting.car.plate_number}</span>
            )}
          </div>
        </div>

        {/* Technical Details - Compact Grid */}
        <div className="grid grid-cols-2 gap-1.5 text-[10px]">
          {carPosting.car?.fuel_type && (
            <div className="flex items-center gap-1 bg-muted/50 px-1.5 py-1 rounded">
              <Fuel className="h-3 w-3 text-primary" />
              <span className="capitalize">{carPosting.car.fuel_type}</span>
            </div>
          )}
          {carPosting.car?.transmission && (
            <div className="flex items-center gap-1 bg-muted/50 px-1.5 py-1 rounded">
              <Settings className="h-3 w-3 text-primary" />
              <span className="capitalize">{carPosting.car.transmission}</span>
            </div>
          )}
          {carPosting.car?.engine_power && (
            <div className="flex items-center gap-1 bg-muted/50 px-1.5 py-1 rounded">
              <Zap className="h-3 w-3 text-primary" />
              <span>{carPosting.car.engine_power}hp</span>
            </div>
          )}
          {carPosting.car?.engine_capacity && (
            <div className="flex items-center gap-1 bg-muted/50 px-1.5 py-1 rounded truncate">
              <span>{carPosting.car.engine_capacity}</span>
            </div>
          )}
        </div>

        {/* Date Range & Price */}
        <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-muted/50 border border-border/30">
          <div className="flex items-center gap-1.5 text-[10px] min-w-0">
            <CalendarDays className="w-3 h-3 text-blue-500 flex-shrink-0" />
            <div className="min-w-0">
              <div className="font-medium truncate">
                {formatDate(carPosting.start_date)} - {formatDate(carPosting.end_date)}
              </div>
              <div className="text-muted-foreground">
                {getDurationInDays()} day{getDurationInDays() > 1 ? 's' : ''}
              </div>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-lg font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              {dumbCurrency(carPosting.price)}
            </div>
            <div className="text-[10px] text-muted-foreground">/ day</div>
          </div>
        </div>

        {/* Reactions & Actions */}
        <div className="flex items-center justify-between pt-1.5 border-t border-border/50">
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            {likeCount > 0 && (
              <>
                <ThumbsUp className="w-3 h-3 text-blue-500 fill-blue-500" />
                <span>{likeCount}</span>
              </>
            )}
            {commentCount > 0 && <span className="ml-2">{commentCount} comments</span>}
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              className={`h-7 px-2 ${liked ? 'text-blue-500' : ''}`}
              onClick={handleLike}
            >
              <ThumbsUp className={`w-3 h-3 ${liked ? 'fill-current' : ''}`} />
            </Button>
            <Button variant="ghost" size="sm" className="h-7 px-2" onClick={handleComment}>
              <MessageCircle className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
