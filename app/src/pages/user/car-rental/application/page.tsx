/* eslint-disable @typescript-eslint/no-explicit-any */
import PageLayout from '@/components/layout/page.layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { dumbCurrency } from '@/lib/dumb-currency';
import { useGetCarRentalById } from '@rest/api';
import { CarRentalRentalStatus } from '@rest/models';
import {
  AlertCircle,
  Calendar,
  Car,
  CheckCircle,
  Clock,
  CreditCard,
  FileText,
  Hash,
  Mail,
  MapPin,
  Phone,
  Shield,
  TrendingUp,
  User,
  XCircle,
} from 'lucide-react';
import type React from 'react';
import { useParams } from 'react-router';

export default function UserCarRentalApplicationPage(): React.ReactElement {
  const { id } = useParams();

  const { data } = useGetCarRentalById(Number(id));

  const rental = data?.data;

  if (!rental) {
    return (
      <PageLayout
        title="Car Rental Booking Request"
        description="View your car rental booking request details."
        withBack={true}
      >
        <div className="min-h-screen bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-purple-500/5 backdrop-blur-sm">
          <div className="container mx-auto p-6 max-w-7xl">
            <div className="space-y-6">
              {/* Loading skeleton cards */}
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <Skeleton className="h-8 w-64" />
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="space-y-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-5 w-32" />
                        </div>
                      ))}
                    </div>
                    <div className="space-y-4">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="space-y-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-5 w-32" />
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'default';
      case 'cancelled':
        return 'destructive';
      case 'pending':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <PageLayout
      title="Car Rental Booking Request"
      description="View your car rental booking request details."
      withBack={true}
    >
      <div className="min-h-screen bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-purple-500/5 backdrop-blur-sm">
        <div className="container mx-auto p-6 max-w-7xl space-y-8">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-cyan-400/20 via-blue-500/20 to-purple-600/20 backdrop-blur-sm">
                  <Hash className="h-6 w-6 text-primary" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Booking Request #{rental.id}
                </h1>
              </div>
              <Badge
                variant={getStatusVariant(rental.rental_status)}
                className="w-fit gap-2 text-sm font-medium px-3 py-1"
              >
                {getStatusIcon(rental.rental_status)}
                {rental.rental_status.charAt(0).toUpperCase() + rental.rental_status.slice(1)}
              </Badge>
            </div>
            <Button
              variant="outline"
              className="border-border/50 bg-card/50 backdrop-blur-sm hover:bg-gradient-to-r hover:from-cyan-500/10 hover:via-blue-500/10 hover:to-purple-500/10"
            >
              <FileText className="h-4 w-4 mr-2" />
              Download Receipt
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Booking Information */}
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-cyan-400/20 via-blue-500/20 to-purple-600/20">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    Booking Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        Rental Duration
                      </div>
                      <p className="text-foreground font-semibold">{rental.days} days</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        Pick-up Date
                      </div>
                      <p className="text-foreground font-semibold">
                        {new Date(rental.start_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        Return Date
                      </div>
                      <p className="text-foreground font-semibold">
                        {rental.return_date
                          ? new Date(rental.return_date).toLocaleDateString()
                          : 'Not returned yet'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <Shield className="h-4 w-4" />
                        Security Deposit
                      </div>
                      <p className="text-foreground font-semibold">
                        ₱{Number(rental.deposit).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <Separator className="bg-border/50" />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <CreditCard className="h-4 w-4" />
                        Payment Method
                      </div>
                      <p className="text-foreground font-semibold capitalize">
                        {rental.payment_method}
                      </p>
                    </div>
                    {rental.payment_reference && (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                          <Hash className="h-4 w-4" />
                          Payment Reference
                        </div>
                        <p className="text-foreground font-semibold font-mono text-sm bg-muted/50 px-2 py-1 rounded">
                          {rental.payment_reference}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Customer Information */}
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-cyan-400/20 via-blue-500/20 to-purple-600/20">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <User className="h-4 w-4" />
                        Name
                      </div>
                      <p className="text-foreground font-semibold">{rental.user?.name || 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        Email
                      </div>
                      <p className="text-foreground font-semibold">{rental.user?.email || 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        Phone
                      </div>
                      <p className="text-foreground font-semibold">{rental.user?.phone || 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        Address
                      </div>
                      <p className="text-foreground font-semibold">
                        {rental.user?.address || 'N/A'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Vehicle Information */}
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-cyan-400/20 via-blue-500/20 to-purple-600/20">
                      <Car className="h-5 w-5 text-primary" />
                    </div>
                    Vehicle Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {rental.car_posting ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          {rental.car_posting.car?.image_url && (
                            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-purple-500/10 p-1">
                              <img
                                src={rental.car_posting.car.image_url}
                                alt={`${rental.car_posting.car?.brand || 'Unknown'} ${rental.car_posting.car?.model || 'Vehicle'}`}
                                className="w-full h-48 object-cover rounded-lg"
                              />
                            </div>
                          )}
                        </div>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <span className="text-sm font-medium text-muted-foreground">
                                Model
                              </span>
                              <p className="text-foreground font-semibold">
                                {rental.car_posting.car?.brand || 'Unknown'}{' '}
                                {rental.car_posting.car?.model || 'Vehicle'}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <span className="text-sm font-medium text-muted-foreground">
                                Year
                              </span>
                              <p className="text-foreground font-semibold">
                                {rental.car_posting.car?.year || 'N/A'}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <span className="text-sm font-medium text-muted-foreground">
                                License Plate
                              </span>
                              <p className="text-foreground font-semibold font-mono text-sm bg-muted/50 px-2 py-1 rounded w-fit">
                                {rental.car_posting.car?.plate_number || 'N/A'}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <span className="text-sm font-medium text-muted-foreground">
                                Vehicle Type
                              </span>
                              <p className="text-foreground font-semibold capitalize">
                                {rental.car_posting.car?.type || 'N/A'}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <span className="text-sm font-medium text-muted-foreground">
                                Transmission
                              </span>
                              <p className="text-foreground font-semibold capitalize">
                                {rental.car_posting.car?.transmission || 'N/A'}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <span className="text-sm font-medium text-muted-foreground">
                                Fuel Type
                              </span>
                              <p className="text-foreground font-semibold capitalize">
                                {rental.car_posting.car?.fuel_type || 'N/A'}
                              </p>
                            </div>
                          </div>
                          <div className="p-4 rounded-lg bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 backdrop-blur-sm">
                            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-1">
                              <TrendingUp className="h-4 w-4" />
                              Daily Rate
                            </div>
                            <p className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                              {dumbCurrency(rental.car_posting.price || 0)}
                            </p>
                          </div>
                        </div>
                      </div>
                      {rental.car_posting.description && (
                        <>
                          <Separator className="bg-border/50" />
                          <div className="space-y-2">
                            <span className="text-sm font-medium text-muted-foreground">
                              Description
                            </span>
                            <div
                              className="text-sm text-foreground leading-relaxed"
                              dangerouslySetInnerHTML={{ __html: rental.car_posting.description }}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="p-4 rounded-full bg-muted/50 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <Car className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground">Vehicle information not available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar - Order Summary */}
            <div className="space-y-6">
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300 sticky top-6">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-cyan-400/20 via-blue-500/20 to-purple-600/20">
                      <CreditCard className="h-5 w-5 text-primary" />
                    </div>
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Daily Rate</span>
                      <span className="text-foreground font-semibold">
                        {dumbCurrency(rental.car_posting?.price || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Duration</span>
                      <span className="text-foreground font-semibold">{rental.days} days</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Subtotal</span>
                      <span className="text-foreground font-semibold">
                        {dumbCurrency(Number(rental.car_posting?.price || 0) * rental.days)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Security Deposit</span>
                      <span className="text-foreground font-semibold">
                        {dumbCurrency(Number(rental.deposit))}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Additional Charges</span>
                      <span className="text-foreground font-semibold">
                        {dumbCurrency(Number((rental as any)?.additional_charges || 0))}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Refundable Amount</span>
                      <span className="text-green-600 font-semibold">
                        {dumbCurrency(Number((rental as any)?.refundable_amount || 0))}
                      </span>
                    </div>
                  </div>

                  <Separator className="bg-border/50" />

                  <div className="p-4 rounded-lg bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 backdrop-blur-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-foreground">Total Amount</span>
                      <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                        ₱
                        {(
                          Number(rental.car_posting?.price || 0) * rental.days +
                          Number(rental.deposit) +
                          Number((rental as any)?.additional_charges || 0)
                        ).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  {/*  */}
                  {rental.rental_status === CarRentalRentalStatus.pending && (
                    <>
                      <Separator className="bg-border/50" />

                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                          <FileText className="h-4 w-4" />
                          Action Required
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                          <Button
                            size="lg"
                            className="flex-1 h-12 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                          >
                            <CheckCircle className="h-5 w-5 mr-2" />
                            Accept Booking
                          </Button>

                          <Button
                            variant="outline"
                            size="lg"
                            className="flex-1 h-12 border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                          >
                            <XCircle className="h-5 w-5 mr-2" />
                            Reject Booking
                          </Button>
                        </div>

                        <p className="text-xs text-muted-foreground text-center">
                          Please review all details carefully before making a decision
                        </p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
