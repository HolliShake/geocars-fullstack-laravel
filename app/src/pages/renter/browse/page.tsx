/* eslint-disable @typescript-eslint/no-explicit-any */
import { CarPostingCard } from '@/components/shared/car-posting-client.component';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CarTypeEnum } from '@/constants/car-type.constant';
import { dumbCurrency } from '@/lib/dumb-currency';
import { RouteKey } from '@/navigation/route';
import { useBrowseCarPosting } from '@rest/api';
import type { CarPosting } from '@rest/models';
import { Car, Loader2, Search, SlidersHorizontal, X } from 'lucide-react';
import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';

// Skeleton loader component for car posting cards
function CarPostingCardSkeleton() {
  return (
    <div className="bg-card/80 backdrop-blur-sm rounded-xl shadow-lg border overflow-hidden">
      <Skeleton className="w-full h-64" />
      <div className="p-4 sm:p-6 space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
        <div className="flex items-center justify-between pt-4">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    </div>
  );
}

export default function RenterBrowsePage(): React.ReactNode {
  const [page, setPage] = useState(1);
  const [allPostings, setAllPostings] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef<HTMLDivElement>(null);
  const [showFilters, setShowFilters] = useState(false);

  const navigate = useNavigate();

  // Filter states
  const [selectedCarTypes, setSelectedCarTypes] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);

  const { data, isLoading } = useBrowseCarPosting({
    page: page,
    rows: 10,
  });

  // Extract unique brands from all postings
  const availableBrands = Array.from(
    new Set(
      allPostings
        .map((posting) => posting.car?.brand)
        .filter((brand): brand is string => Boolean(brand))
    )
  ).sort();

  useEffect(() => {
    if (data?.data) {
      const newPostings = data.data.data || [];

      if (page === 1) {
        setAllPostings(newPostings);
      } else {
        setAllPostings((prev) => {
          // Prevent duplicates by checking if posting already exists
          const existingIds = new Set(prev.map((p) => p.id));
          const uniqueNewPostings = newPostings.filter((p) => !existingIds.has(p.id));
          return [...prev, ...uniqueNewPostings];
        });
      }

      // Check if there are more pages
      setHasMore((data.data.current_page ?? 0) < (data.data.last_page ?? 0));
    }
  }, [data, page]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, isLoading]);

  const handleClick = (posting: CarPosting) => {
    navigate(RouteKey.Renter.Application.parse(posting.id));
  };

  const handleLoadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      setPage((prev) => prev + 1);
    }
  }, [hasMore, isLoading]);

  const toggleCarType = (type: string) => {
    setSelectedCarTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const clearFilters = () => {
    setSelectedCarTypes([]);
    setSelectedBrands([]);
    setPriceRange([0, 10000]);
  };

  const activeFiltersCount =
    selectedCarTypes.length +
    selectedBrands.length +
    (priceRange[0] > 0 || priceRange[1] < 10000 ? 1 : 0);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/20">
      {/* Enhanced Header with Gradient */}
      <div className="bg-card/95 backdrop-blur-sm border-b z-10 shadow-lg flex-shrink-0">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg">
                <Car className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Browse Cars
              </h1>
            </div>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full shadow-sm relative"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="w-4 h-4 sm:w-5 sm:h-5" />
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by make, model..."
              className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 text-sm sm:text-base bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Main Content with Sidebar */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8 flex gap-4 sm:gap-6 h-full">
          {/* Mobile Filter Overlay */}
          {showFilters && (
            <div
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setShowFilters(false)}
            />
          )}

          {/* Sticky Sidebar Filters */}
          <aside
            className={`
              fixed lg:static inset-y-0 left-0 z-50 w-80 sm:w-64 lg:w-64 flex-shrink-0 
              transform transition-transform duration-300 ease-in-out
              ${showFilters ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}
          >
            <div className="h-full overflow-y-auto bg-background lg:bg-transparent p-4 lg:p-0">
              <div className="lg:sticky lg:top-4">
                {/* Mobile Close Button */}
                <div className="flex items-center justify-between mb-4 lg:hidden">
                  <h2 className="text-lg font-semibold">Filters</h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowFilters(false)}
                    className="rounded-full"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                <div className="space-y-4 sm:space-y-6">
                  {/* Filter Card */}
                  <div className="bg-card/80 backdrop-blur-sm rounded-xl shadow-lg border p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-base sm:text-lg font-semibold">Filters</h2>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        Clear All
                      </Button>
                    </div>

                    {/* Car Type Filter */}
                    <div className="space-y-3 mb-6">
                      <h3 className="text-sm font-medium text-muted-foreground">Car Type</h3>
                      <div className="space-y-2">
                        {Object.values(CarTypeEnum).map((type) => (
                          <label
                            key={type}
                            className="flex items-center gap-2 cursor-pointer group"
                          >
                            <input
                              type="checkbox"
                              checked={selectedCarTypes.includes(type)}
                              onChange={() => toggleCarType(type)}
                              className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <span className="text-sm capitalize group-hover:text-primary transition-colors">
                              {type}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Brand Filter */}
                    <div className="space-y-3 mb-6">
                      <h3 className="text-sm font-medium text-muted-foreground">Brand</h3>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {availableBrands.length > 0 ? (
                          availableBrands.map((brand) => (
                            <label
                              key={brand}
                              className="flex items-center gap-2 cursor-pointer group"
                            >
                              <input
                                type="checkbox"
                                checked={selectedBrands.includes(brand)}
                                onChange={() => toggleBrand(brand)}
                                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                              />
                              <span className="text-sm group-hover:text-primary transition-colors">
                                {brand}
                              </span>
                            </label>
                          ))
                        ) : (
                          <p className="text-xs text-muted-foreground">No brands available</p>
                        )}
                      </div>
                    </div>

                    {/* Price Range Filter */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-medium text-muted-foreground">
                        Price Range (per day)
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={priceRange[0]}
                            onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                            className="w-full px-2 sm:px-3 py-2 text-sm bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                            placeholder="Min"
                          />
                          <span className="text-muted-foreground">-</span>
                          <input
                            type="number"
                            value={priceRange[1]}
                            onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                            className="w-full px-2 sm:px-3 py-2 text-sm bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                            placeholder="Max"
                          />
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="10000"
                          value={priceRange[1]}
                          onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{dumbCurrency(priceRange[0])}</span>
                          <span>{dumbCurrency(priceRange[1])}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Active Filters Summary */}
                  {(selectedCarTypes.length > 0 ||
                    selectedBrands.length > 0 ||
                    priceRange[0] > 0 ||
                    priceRange[1] < 10000) && (
                    <div className="bg-card/80 backdrop-blur-sm rounded-xl shadow-lg border p-4">
                      <h3 className="text-sm font-medium mb-2">Active Filters</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedCarTypes.map((type) => (
                          <span
                            key={`filter-type-${type}`}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                          >
                            {type}
                          </span>
                        ))}
                        {selectedBrands.map((brand) => (
                          <span
                            key={`filter-brand-${brand}`}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                          >
                            {brand}
                          </span>
                        ))}
                        {(priceRange[0] > 0 || priceRange[1] < 10000) && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                            {dumbCurrency(priceRange[0])} - {dumbCurrency(priceRange[1])}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Mobile Apply Button */}
                  <Button className="w-full lg:hidden" onClick={() => setShowFilters(false)}>
                    Apply Filters
                  </Button>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Feed Container */}
          <div className="flex-1 min-w-0 overflow-y-auto">
            {/* Stats Bar */}
            {allPostings.length > 0 && (
              <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs sm:text-sm text-muted-foreground bg-card/50 backdrop-blur-sm rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 border shadow-sm">
                <span className="font-medium">
                  Showing{' '}
                  <span className="text-foreground font-semibold">{allPostings.length}</span>{' '}
                  available cars
                </span>
                {hasMore && <span className="text-xs">Scroll for more</span>}
              </div>
            )}

            {/* Initial Loading State with Skeletons */}
            {isLoading && allPostings.length === 0 && (
              <div className="space-y-4 sm:space-y-6">
                {[...Array(3)].map((_, index) => (
                  <CarPostingCardSkeleton key={`skeleton-${index}`} />
                ))}
              </div>
            )}

            {allPostings.length === 0 && !isLoading && (
              <div className="bg-card/80 backdrop-blur-sm rounded-xl shadow-lg p-8 sm:p-16 text-center border">
                <div className="inline-flex p-3 sm:p-4 bg-muted/50 rounded-full mb-3 sm:mb-4">
                  <Car className="w-8 h-8 sm:w-12 sm:h-12 text-muted-foreground" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2">No Cars Available</h3>
                <p className="text-sm sm:text-base text-muted-foreground">
                  No car postings available at the moment. Check back soon!
                </p>
              </div>
            )}

            {/* Feed Items with Enhanced Spacing */}
            <div className="space-y-4 sm:space-y-6">
              {allPostings.map((posting, index) => (
                <div
                  key={`posting-${posting.id}-${index}`}
                  className="animate-in fade-in slide-in-from-bottom-4"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <CarPostingCard
                    imageUrl={posting.car?.image_url || '/placeholder-car.jpg'}
                    carPosting={posting}
                    onClick={() => {
                      handleClick(posting);
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Enhanced Loading indicator for pagination */}
            {isLoading && allPostings.length > 0 && (
              <div className="flex justify-center items-center py-8 sm:py-12">
                <div className="bg-card/80 backdrop-blur-sm rounded-xl shadow-lg p-6 sm:p-8 border">
                  <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 animate-spin text-primary mx-auto mb-2 sm:mb-3" />
                  <p className="text-xs sm:text-sm text-muted-foreground">Loading more cars...</p>
                </div>
              </div>
            )}

            {/* Intersection observer target */}
            <div ref={observerTarget} className="h-4" />

            {/* Enhanced Load More Button */}
            {hasMore && !isLoading && allPostings.length > 0 && (
              <div className="flex justify-center mt-6 sm:mt-8">
                <Button
                  onClick={handleLoadMore}
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto sm:min-w-[240px] shadow-md hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50 rounded-full"
                >
                  <span className="mr-2">Load More Cars</span>
                  <Car className="w-4 h-4" />
                </Button>
              </div>
            )}

            {/* Enhanced End of results message */}
            {!hasMore && allPostings.length > 0 && (
              <div className="text-center py-8 sm:py-12">
                <div className="bg-card/80 backdrop-blur-sm rounded-xl shadow-lg p-6 sm:p-8 border inline-block">
                  <div className="inline-flex p-2.5 sm:p-3 bg-primary/10 rounded-full mb-2 sm:mb-3">
                    <Car className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                  </div>
                  <p className="text-sm sm:text-base text-muted-foreground font-medium">
                    You've reached the end of the listings
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground/70 mt-1">
                    Check back later for new cars
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
