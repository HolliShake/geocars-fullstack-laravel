import { useModal } from '@/components/custom/modal.component';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ReactionEnum, type Reaction } from '@/constants/reaction.constant';
import { dumbCurrency } from '@/lib/dumb-currency';
import { useCreateReaction, useDeleteReaction, useUpdateReaction } from '@rest/api';
import type { CarPosting } from '@rest/models/carPosting';
import {
  Calendar,
  CalendarDays,
  Frown,
  Fuel,
  Heart,
  Laugh,
  MessageCircle,
  Settings,
  Smile,
  ThumbsDown,
  ThumbsUp,
  Zap,
} from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import CarPostingCommentModal from './car-posting-comments.component';

interface CarPostingCardProps {
  imageUrl: string;
  carPosting: CarPosting;
  onClick: () => void;
  onReact: () => void;
}

export const CarPostingCard: React.FC<CarPostingCardProps> = ({
  imageUrl,
  carPosting,
  onClick,
  onReact,
}) => {
  const [liked, setLiked] = useState(carPosting.user_reaction != null);
  const [likeCount, setLikeCount] = useState(carPosting.total_reactions!);
  const [currentReaction, setCurrentReaction] = useState(carPosting.user_reaction?.reaction);
  const [commentCount] = useState(carPosting.total_comments ?? 0);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const { mutateAsync: createReaction, isPending: isCreatingReaction } = useCreateReaction();
  const { mutateAsync: updateReaction, isPending: isUpdatingReaction } = useUpdateReaction();
  const { mutateAsync: deleteReaction, isPending: isDeletingReaction } = useDeleteReaction();

  const isReacting = useMemo(
    () => isCreatingReaction || isUpdatingReaction || isDeletingReaction,
    [isCreatingReaction, isUpdatingReaction, isDeletingReaction]
  );

  const modal = useModal<CarPosting>();

  // Sync state with prop changes
  useEffect(() => {
    setLiked(carPosting.user_reaction != null);
    setLikeCount(carPosting.total_reactions!);
    setCurrentReaction(carPosting.user_reaction?.reaction);
  }, [carPosting.user_reaction, carPosting.total_reactions]);

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

  const handleLike = async (e: React.MouseEvent, reaction: Reaction) => {
    e.stopPropagation();
    setPopoverOpen(false);

    const previousLiked = liked;
    const previousLikeCount = likeCount;
    const previousReaction = currentReaction;

    try {
      if (liked) {
        if (!carPosting.user_reaction?.id) return;
        if (reaction !== carPosting.user_reaction?.reaction) {
          // Update reaction - optimistic update
          setCurrentReaction(reaction);
          await updateReaction({
            id: carPosting.user_reaction!.id!,
            data: {
              ...carPosting.user_reaction!,
              reaction: reaction,
            },
          });
          onReact();
          return;
        }
        // Delete reaction - optimistic update
        setLiked(false);
        setLikeCount((prev) => prev - 1);
        setCurrentReaction(undefined);
        await deleteReaction({
          id: carPosting.user_reaction!.id!,
        });
        onReact();
      } else {
        // Create reaction - optimistic update
        setLiked(true);
        setLikeCount((prev) => prev + 1);
        setCurrentReaction(reaction);
        await createReaction({
          data: {
            reaction: reaction,
            car_posting_id: carPosting.id!,
            user_id: 0,
          },
        });
        onReact();
      }
    } catch (error) {
      // Revert optimistic updates on error
      setLiked(previousLiked);
      setLikeCount(previousLikeCount);
      setCurrentReaction(previousReaction);
      toast.error('Failed to update reaction');
      console.error('Failed to update reaction', error);
    }
  };

  const handleComment = (e: React.MouseEvent) => {
    e.stopPropagation();
    modal.openFn(carPosting);
  };

  const renderReaction = () => {
    switch (currentReaction) {
      case ReactionEnum.DISLIKE:
        return <ThumbsDown className={`w-4 h-4 ${liked ? 'fill-red-500' : ''}`} />;
      case ReactionEnum.LOVE:
        return <Heart className={`w-4 h-4 ${liked ? 'fill-red-500' : ''}`} />;
      case ReactionEnum.HAHA:
        return <Laugh className={`w-4 h-4 ${liked ? 'fill-yellow-500' : ''}`} />;
      case ReactionEnum.WOW:
        return <Smile className={`w-4 h-4 ${liked ? 'fill-blue-500' : ''}`} />;
      case ReactionEnum.SAD:
        return <Frown className={`w-4 h-4 ${liked ? 'fill-gray-500' : ''}`} />;
      case ReactionEnum.LIKE:
      default:
        return <ThumbsUp className={`w-4 h-4 ${liked ? 'fill-blue-500' : ''}`} />;
    }
  };

  return (
    <Card
      className="select-none overflow-hidden group hover:shadow-lg transition-all duration-300 cursor-pointer"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
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
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={isReacting}
                  onClick={(e) => e.stopPropagation()}
                  onMouseEnter={(e) => e.stopPropagation()}
                >
                  {renderReaction()}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto p-2"
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-lg hover:scale-125 transition-transform"
                    onClick={(e) => handleLike(e, ReactionEnum.LIKE)}
                  >
                    👍
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-lg hover:scale-125 transition-transform"
                    onClick={(e) => handleLike(e, ReactionEnum.DISLIKE)}
                  >
                    👎
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-lg hover:scale-125 transition-transform"
                    onClick={(e) => handleLike(e, ReactionEnum.LOVE)}
                  >
                    ❤️
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-lg hover:scale-125 transition-transform"
                    onClick={(e) => handleLike(e, ReactionEnum.HAHA)}
                  >
                    😂
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-lg hover:scale-125 transition-transform"
                    onClick={(e) => handleLike(e, ReactionEnum.WOW)}
                  >
                    😮
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-lg hover:scale-125 transition-transform"
                    onClick={(e) => handleLike(e, ReactionEnum.SAD)}
                  >
                    😢
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            <Button variant="ghost" size="sm" className="h-7 px-2" onClick={handleComment}>
              <MessageCircle className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardContent>

      <CarPostingCommentModal controller={modal} />
    </Card>
  );
};
