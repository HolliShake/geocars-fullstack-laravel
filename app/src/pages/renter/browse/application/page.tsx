import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { dumbCurrency } from '@/lib/dumb-currency';
import { useCheckCarPostingSubmission, useCreateCarRental, useGetCarPostingById } from '@rest/api';
import type { CarRental } from '@rest/models';
import {
  ArrowLeft,
  Calendar,
  CalendarDays,
  Car,
  Clock,
  Fuel,
  MapPin,
  Settings,
  Shield,
  Star,
  Zap,
} from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';

function ApplicationSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-80 w-full rounded-2xl" />
            <Skeleton className="h-48 w-full rounded-2xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-96 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RenterApplication(): React.ReactNode {
  const navigate = useNavigate();
  const { postingId } = useParams<{ postingId: string }>();
  const { data, isLoading } = useGetCarPostingById(Number(postingId));
  const [rentalDays, setRentalDays] = useState<number>(1);
  const [deposit, setDeposit] = useState<number>(0);
  const { mutateAsync: submitApplication, isPending: isSubmitting } = useCreateCarRental();
  const { data: submission, isLoading: isChecking } = useCheckCarPostingSubmission(
    Number(postingId)
  );

  const handleSubmitApplication = async () => {
    try {
      const startDate = new Date(carPosting.start_date);

      await submitApplication({
        data: {
          car_posting_id: Number(postingId),
          user_id: 0, // zero means, current user in the backend
          days: rentalDays,
          deposit: deposit,
          start_date: startDate.toISOString().split('T')[0],
        } as CarRental,
      });

      toast.success('Application submitted successfully!');
      navigate('/renter/rentals');
    } catch (error) {
      toast.error('Failed to submit application. Please try again.');
      console.error('Application submission error:', error);
    }
  };

  if (isLoading) {
    return <ApplicationSkeleton />;
  }

  if (!data?.data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
            <Car className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-3xl font-bold mb-3">Car Posting Not Found</h2>
          <p className="text-muted-foreground text-lg">
            The car posting you're looking for doesn't exist or has been removed.
          </p>
          <Button variant="outline" className="mt-6" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const carPosting = data.data;
  const car = carPosting.car;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const calculateTotal = () => {
    return carPosting.price * rentalDays;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" className="p-2" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-4xl font-bold tracking-tight">
              {car?.brand} {car?.model}
            </h1>
            <p className="text-muted-foreground text-lg mt-1">Complete your rental application</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Image */}
            <Card className="overflow-hidden border-0 shadow-lg">
              <div className="relative aspect-[16/10]">
                <img
                  src={car?.image_url || '/placeholder-car.jpg'}
                  alt={`${car?.brand} ${car?.model}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                <div className="absolute top-6 left-6">
                  <Badge
                    variant={carPosting.is_available ? 'default' : 'destructive'}
                    className="text-sm px-3 py-1 shadow-lg"
                  >
                    {carPosting.is_available ? 'Available Now' : 'Not Available'}
                  </Badge>
                </div>
                <div className="absolute bottom-6 right-6 flex gap-2">
                  <div className="bg-white/10 backdrop-blur-md rounded-full px-3 py-2 text-white text-sm">
                    <Star className="w-4 h-4 inline mr-1" />
                    4.8
                  </div>
                </div>
              </div>
            </Card>

            {/* Owner Info */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                      {car?.user_company?.name?.[0] || 'P'}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">
                        {car?.user_company?.name || 'Private Owner'}
                      </h3>
                      <p className="text-muted-foreground flex items-center gap-1">
                        <Shield className="w-4 h-4" />
                        Verified Host
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">4.9</div>
                    <div className="text-sm text-muted-foreground">Rating</div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Vehicle Specifications */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl">Vehicle Specifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {car?.year && (
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Year</div>
                        <div className="font-semibold text-lg">{car.year}</div>
                      </div>
                    </div>
                  )}
                  {car?.type && (
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                        <Car className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Type</div>
                        <div className="font-semibold text-lg">{car.type}</div>
                      </div>
                    </div>
                  )}
                  {car?.fuel_type && (
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50">
                      <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                        <Fuel className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Fuel</div>
                        <div className="font-semibold text-lg">{car.fuel_type}</div>
                      </div>
                    </div>
                  )}
                  {car?.transmission && (
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50">
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                        <Settings className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Transmission</div>
                        <div className="font-semibold text-lg">{car.transmission}</div>
                      </div>
                    </div>
                  )}
                  {car?.engine_power && (
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50">
                      <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                        <Zap className="w-5 h-5 text-yellow-600" />
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Power</div>
                        <div className="font-semibold text-lg">{car.engine_power}hp</div>
                      </div>
                    </div>
                  )}
                  {car?.engine_capacity && (
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50">
                      <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                        <Settings className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Capacity</div>
                        <div className="font-semibold text-lg">{car.engine_capacity}</div>
                      </div>
                    </div>
                  )}
                </div>

                {(car?.color || car?.plate_number) && (
                  <>
                    <Separator className="my-6" />
                    <div className="grid grid-cols-2 gap-6">
                      {car?.color && (
                        <div>
                          <div className="text-sm text-muted-foreground mb-2">Color</div>
                          <div className="font-semibold text-lg">{car.color}</div>
                        </div>
                      )}
                      {car?.plate_number && (
                        <div>
                          <div className="text-sm text-muted-foreground mb-2">Plate Number</div>
                          <div className="font-semibold text-lg font-mono bg-muted px-3 py-1 rounded-md inline-block">
                            {car.plate_number}
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Booking Summary */}
            <Card className="border-0 shadow-lg sticky top-6">
              <CardHeader>
                <CardTitle className="text-2xl">Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Availability Period */}
                <div className="p-4 rounded-xl border bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
                  <div className="flex items-center gap-3 mb-3">
                    <CalendarDays className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold">Available Period</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">From:</span>
                      <span className="font-medium">{formatDate(carPosting.start_date)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">To:</span>
                      <span className="font-medium">{formatDate(carPosting.end_date)}</span>
                    </div>
                  </div>
                </div>

                {/* Rental Duration Input */}
                <div className="space-y-3">
                  <Label htmlFor="rental-days" className="text-base font-semibold">
                    Rental Duration
                  </Label>
                  <div className="flex items-center gap-3 justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setRentalDays(Math.max(1, rentalDays - 1))}
                      disabled={rentalDays <= 1}
                    >
                      -
                    </Button>
                    <div className="flex-1 text-center">
                      <span className="text-2xl font-bold">{rentalDays}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setRentalDays(rentalDays + 1)}
                    >
                      +
                    </Button>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>day{rentalDays > 1 ? 's' : ''}</span>
                  </div>
                </div>

                {/* Pricing */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Price per day</span>
                    <span className="text-2xl font-bold text-green-600">
                      {dumbCurrency(carPosting.price)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Duration</span>
                    <span>
                      {rentalDays} day{rentalDays > 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Deposit Input */}
                  <div className="space-y-3">
                    <Label htmlFor="deposit" className="text-base font-semibold">
                      Security Deposit
                    </Label>
                    <div className="space-y-2">
                      <input
                        id="deposit"
                        type="number"
                        min="0"
                        max={calculateTotal() - 1}
                        value={deposit}
                        onChange={(e) => {
                          const value = Number(e.target.value);
                          if (value >= calculateTotal()) {
                            toast.error('Deposit must be less than total rental amount');
                            return;
                          }
                          setDeposit(Math.max(0, value));
                        }}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Enter deposit amount"
                      />
                      {deposit >= calculateTotal() && (
                        <p className="text-sm text-red-500">
                          Deposit must be less than rental amount ({dumbCurrency(calculateTotal())})
                        </p>
                      )}
                    </div>
                  </div>

                  <Separator />
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Rental Cost</span>
                      <span>{dumbCurrency(calculateTotal())}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Security Deposit</span>
                      <span>{dumbCurrency(deposit)}</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between text-lg font-bold">
                      <span>Total Amount</span>
                      <span className="text-2xl text-green-600">
                        {dumbCurrency(calculateTotal())}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {carPosting.description && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-semibold mb-2">Additional Notes</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {carPosting.description}
                      </p>
                    </div>
                  </>
                )}

                {/* Action Buttons */}
                <div className="pt-4 space-y-3">
                  {isChecking ? (
                    <Skeleton className="h-12 w-full" />
                  ) : (
                    <>
                      {submission?.data?.submitted && (
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                          <Shield className="w-4 h-4 text-blue-600" />
                          <span className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                            Application already submitted
                          </span>
                        </div>
                      )}
                      <Button
                        className="w-full h-12 text-lg font-semibold shadow-lg"
                        disabled={
                          !carPosting.is_available ||
                          rentalDays < 1 ||
                          submission?.data?.submitted ||
                          isSubmitting
                        }
                        onClick={handleSubmitApplication}
                      >
                        {isSubmitting
                          ? 'Submitting...'
                          : submission?.data?.submitted
                            ? 'Application Submitted'
                            : carPosting.is_available
                              ? 'Submit Application'
                              : 'Not Available'}
                      </Button>
                    </>
                  )}
                </div>

                {/* Trust indicators */}
                <div className="pt-4 border-t space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Shield className="w-4 h-4" />
                    <span>Secure booking process</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>GPS tracking included</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
