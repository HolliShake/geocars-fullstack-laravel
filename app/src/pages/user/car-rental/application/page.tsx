/* eslint-disable @typescript-eslint/no-explicit-any */
import { useConfirm } from '@/components/confirm.provider';
import PageLayout from '@/components/layout/page.layout';
import { FileViewer } from '@/components/shared/file-viewer.component';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { dumbCurrency } from '@/lib/dumb-currency';
import { useGetCarRentalById, useUpdateCarRental } from '@rest/api';
import { CarRentalRentalStatus, type CarRental, type UserRequirement } from '@rest/models';
import {
  AlertTriangle,
  Calendar,
  Car,
  CheckCircle,
  CheckCircle2,
  Clock,
  CreditCard,
  Eye,
  FileText,
  Hash,
  Mail,
  MapPin,
  Phone,
  Shield,
  TrendingUp,
  Upload,
  User,
  XCircle,
} from 'lucide-react';
import type React from 'react';
import { useEffect } from 'react';
import { useParams } from 'react-router';
import { toast } from 'sonner';

export default function UserCarRentalApplicationPage(): React.ReactElement {
  const { id } = useParams();

  const { data, isLoading, refetch: refetchRental } = useGetCarRentalById(Number(id));

  const rental = data?.data;

  const { mutateAsync: updateRental } = useUpdateCarRental();

  const confirm = useConfirm();

  const handleApproveRental = async (id: number) => {
    try {
      await updateRental({
        id,
        data: {
          ...rental,
          rental_status: CarRentalRentalStatus.confirmed,
        } as CarRental,
      });
      toast.success('Rental approved successfully');
      refetchRental();
    } catch {
      toast.error('Failed to approve rental');
    }
  };

  const handleRejectRental = async (id: number) => {
    try {
      await updateRental({
        id,
        data: {
          ...rental,
          rental_status: CarRentalRentalStatus.rejected,
        } as CarRental,
      });
      toast.success('Rental rejected successfully');
      refetchRental();
    } catch {
      toast.error('Failed to reject rental');
    }
  };

  useEffect(() => {
    console.log(JSON.stringify(data?.data ?? {}, null, 2));
  }, [data]);

  if (isLoading || !rental) {
    return (
      <PageLayout
        title="Car Rental Booking Request"
        description="View your car rental booking request details."
        withBack={true}
      >
        <div className="min-h-screen bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-purple-500/5 backdrop-blur-sm">
          <div className="container mx-auto p-4 sm:p-6 max-w-7xl">
            <div className="space-y-4 sm:space-y-6">
              {/* Loading skeleton cards */}
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <Skeleton className="h-6 sm:h-8 w-48 sm:w-64" />
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-3 sm:space-y-4">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="space-y-2">
                          <Skeleton className="h-3 sm:h-4 w-20 sm:w-24" />
                          <Skeleton className="h-4 sm:h-5 w-28 sm:w-32" />
                        </div>
                      ))}
                    </div>
                    <div className="space-y-3 sm:space-y-4">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="space-y-2">
                          <Skeleton className="h-3 sm:h-4 w-20 sm:w-24" />
                          <Skeleton className="h-4 sm:h-5 w-28 sm:w-32" />
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
        return <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4" />;
      case 'cancelled':
        return <XCircle className="h-3 w-3 sm:h-4 sm:w-4" />;
      case 'pending':
        return <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4" />;
      case 'completed':
        return <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />;
      default:
        return <Clock className="h-3 w-3 sm:h-4 sm:w-4" />;
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
      case 'completed':
        return 'default';
      default:
        return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200 animate-pulse';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 animate-pulse';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <PageLayout
      title="Car Rental Booking Request"
      description="View your car rental booking request details."
      withBack={true}
    >
      <div className="min-h-screen bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-purple-500/5 backdrop-blur-sm">
        <div className="container mx-auto p-3 sm:p-4 md:p-6 max-w-7xl space-y-4 sm:space-y-6 lg:space-y-8">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-r from-cyan-400/20 via-blue-500/20 to-purple-600/20 backdrop-blur-sm">
                  <Hash className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-primary" />
                </div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent break-words">
                  Booking Request #{rental.id}
                </h1>
              </div>
              <Badge
                variant={getStatusVariant(rental.rental_status)}
                className={`w-fit gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium px-2 sm:px-3 py-0.5 sm:py-1 ${getStatusColor(rental.rental_status)}`}
              >
                {getStatusIcon(rental.rental_status)}
                {rental.rental_status.charAt(0).toUpperCase() + rental.rental_status.slice(1)}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {/* Main Content */}
            <div className="xl:col-span-2 space-y-4 sm:space-y-4 lg:space-y-6">
              {/* Booking Information */}
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
                  <CardTitle className="flex items-center gap-2 sm:gap-3 text-base sm:text-lg md:text-xl">
                    <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-r from-cyan-400/20 via-blue-500/20 to-purple-600/20">
                      <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    </div>
                    Booking Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-muted-foreground">
                        <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                        Rental Duration
                      </div>
                      <p className="text-sm sm:text-base text-foreground font-semibold">
                        {rental.days} days
                      </p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-muted-foreground">
                        <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                        Pick-up Date
                      </div>
                      <p className="text-sm sm:text-base text-foreground font-semibold">
                        {new Date(rental.start_date).toLocaleDateString()}
                      </p>
                    </div>
                    {(rental.rental_status === CarRentalRentalStatus.confirmed ||
                      rental.rental_status === CarRentalRentalStatus.completed) && (
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-muted-foreground">
                          <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                          Return Date
                        </div>
                        <p className="text-sm sm:text-base text-foreground font-semibold">
                          {rental.return_date
                            ? new Date(rental.return_date).toLocaleDateString()
                            : 'Not returned yet'}
                        </p>
                      </div>
                    )}
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-muted-foreground">
                        <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
                        Security Deposit
                      </div>
                      <p className="text-sm sm:text-base text-foreground font-semibold">
                        ₱{Number(rental.deposit).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <Separator className="bg-border/50" />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-muted-foreground">
                        <CreditCard className="h-3 w-3 sm:h-4 sm:w-4" />
                        Payment Method
                      </div>
                      <p className="text-sm sm:text-base text-foreground font-semibold capitalize">
                        {rental.payment_method}
                      </p>
                    </div>
                    {rental.payment_reference && (
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-muted-foreground">
                          <Hash className="h-3 w-3 sm:h-4 sm:w-4" />
                          Payment Reference
                        </div>
                        <p className="text-xs sm:text-sm text-foreground font-semibold font-mono bg-muted/50 px-2 py-1 rounded break-all">
                          {rental.payment_reference}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Customer Information */}
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
                  <CardTitle className="flex items-center gap-2 sm:gap-3 text-base sm:text-lg md:text-xl">
                    <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-r from-cyan-400/20 via-blue-500/20 to-purple-600/20">
                      <User className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    </div>
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-muted-foreground">
                        <User className="h-3 w-3 sm:h-4 sm:w-4" />
                        Name
                      </div>
                      <p className="text-sm sm:text-base text-foreground font-semibold break-words">
                        {rental.user?.name || 'N/A'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-muted-foreground">
                        <Mail className="h-3 w-3 sm:h-4 sm:w-4" />
                        Email
                      </div>
                      <p className="text-sm sm:text-base text-foreground font-semibold break-all">
                        {rental.user?.email || 'N/A'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-muted-foreground">
                        <Phone className="h-3 w-3 sm:h-4 sm:w-4" />
                        Phone
                      </div>
                      <p className="text-sm sm:text-base text-foreground font-semibold">
                        {rental.user?.phone || 'N/A'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-muted-foreground">
                        <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                        Address
                      </div>
                      <p className="text-sm sm:text-base text-foreground font-semibold break-words">
                        {rental.user?.address || 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* Requirements Section */}
                  {rental.user?.requirements && rental.user.requirements.length > 0 && (
                    <>
                      <Separator className="bg-border/50" />
                      <div className="space-y-4 sm:space-y-6">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-r from-cyan-400/20 via-blue-500/20 to-purple-600/20">
                            <Upload className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="text-base sm:text-lg font-semibold text-foreground">
                              Requirements
                            </h3>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              Customer submitted documents and requirements
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:gap-4">
                          {rental.user.requirements.map(
                            (requirement: UserRequirement, index: number) => (
                              <Card
                                key={index}
                                className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-md transition-all duration-200"
                              >
                                <CardContent className="p-3 sm:p-4">
                                  <div className="space-y-3 sm:space-y-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                      <div className="flex items-center gap-2 sm:gap-3">
                                        <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-r from-cyan-400/20 via-blue-500/20 to-purple-600/20 flex-shrink-0">
                                          <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                                        </div>
                                        <div className="min-w-0">
                                          <h4 className="text-sm sm:text-base font-semibold text-foreground break-words">
                                            {requirement.requirement?.name || 'Unnamed Requirement'}
                                          </h4>
                                          <p className="text-xs sm:text-sm text-muted-foreground break-words">
                                            {requirement.requirement?.description ||
                                              'No description available'}
                                          </p>
                                        </div>
                                      </div>
                                      <Badge
                                        variant={requirement.uploads ? 'default' : 'secondary'}
                                        className={`w-fit flex-shrink-0 text-xs ${
                                          requirement.uploads
                                            ? 'bg-green-100 text-green-800 border-green-200'
                                            : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                                        }`}
                                      >
                                        {requirement.uploads ? (
                                          <>
                                            <CheckCircle2 className="h-3 w-3 mr-1" />
                                            Submitted
                                          </>
                                        ) : (
                                          <>
                                            <AlertTriangle className="h-3 w-3 mr-1" />
                                            Pending
                                          </>
                                        )}
                                      </Badge>
                                    </div>

                                    {requirement.uploads && (
                                      <div className="space-y-2 sm:space-y-3">
                                        <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-muted-foreground">
                                          <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                                          Uploaded Document
                                        </div>
                                        <FileViewer
                                          file={requirement.uploads}
                                          className="hover:shadow-lg transition-all duration-200"
                                        />
                                      </div>
                                    )}

                                    {!requirement.uploads && (
                                      <div className="flex items-center justify-center py-6 sm:py-8 text-center">
                                        <div className="space-y-2">
                                          <div className="p-2 sm:p-3 rounded-full bg-muted/50 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center mx-auto">
                                            <Upload className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
                                          </div>
                                          <p className="text-xs sm:text-sm text-muted-foreground">
                                            No document uploaded yet
                                          </p>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            )
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Vehicle Information */}
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
                  <CardTitle className="flex items-center gap-2 sm:gap-3 text-base sm:text-lg md:text-xl">
                    <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-r from-cyan-400/20 via-blue-500/20 to-purple-600/20">
                      <Car className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    </div>
                    Vehicle Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 sm:px-6">
                  {rental.car_posting ? (
                    <div className="space-y-4 sm:space-y-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                        <div className="space-y-3 sm:space-y-4">
                          {rental.car_posting.car?.image_url && (
                            <div className="relative group overflow-hidden rounded-xl bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-purple-500/10 p-1">
                              <img
                                src={rental.car_posting.car.image_url}
                                alt={`${rental.car_posting.car?.brand || 'Unknown'} ${rental.car_posting.car?.model || 'Vehicle'}`}
                                className="w-full h-40 sm:h-48 md:h-56 lg:h-64 object-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 rounded-lg" />
                              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  className="h-7 w-7 sm:h-8 sm:w-8 p-0 bg-white/90 hover:bg-white"
                                  onClick={() =>
                                    rental.car_posting?.car?.image_url &&
                                    window.open(rental.car_posting.car.image_url, '_blank')
                                  }
                                >
                                  <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="space-y-3 sm:space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            <div className="space-y-1">
                              <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                                Model
                              </span>
                              <p className="text-sm sm:text-base text-foreground font-semibold break-words">
                                {rental.car_posting.car?.brand || 'Unknown'}{' '}
                                {rental.car_posting.car?.model || 'Vehicle'}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                                Year
                              </span>
                              <p className="text-sm sm:text-base text-foreground font-semibold">
                                {rental.car_posting.car?.year || 'N/A'}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                                License Plate
                              </span>
                              <p className="text-xs sm:text-sm text-foreground font-semibold font-mono bg-muted/50 px-2 py-1 rounded break-all">
                                {rental.car_posting.car?.plate_number || 'N/A'}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                                Vehicle Type
                              </span>
                              <p className="text-sm sm:text-base text-foreground font-semibold capitalize">
                                {rental.car_posting.car?.type || 'N/A'}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                                Transmission
                              </span>
                              <p className="text-sm sm:text-base text-foreground font-semibold capitalize">
                                {rental.car_posting.car?.transmission || 'N/A'}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                                Fuel Type
                              </span>
                              <p className="text-sm sm:text-base text-foreground font-semibold capitalize">
                                {rental.car_posting.car?.fuel_type || 'N/A'}
                              </p>
                            </div>
                          </div>
                          <div className="p-3 sm:p-4 rounded-lg bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 backdrop-blur-sm">
                            <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-muted-foreground mb-1">
                              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
                              Daily Rate
                            </div>
                            <p className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                              {dumbCurrency(rental.car_posting.price || 0)}
                            </p>
                          </div>
                        </div>
                      </div>
                      {rental.car_posting.description && (
                        <>
                          <Separator className="bg-border/50" />
                          <div className="space-y-2">
                            <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                              Description
                            </span>
                            <div
                              className="text-xs sm:text-sm text-foreground leading-relaxed"
                              dangerouslySetInnerHTML={{ __html: rental.car_posting.description }}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 sm:py-12">
                      <div className="p-3 sm:p-4 rounded-full bg-muted/50 w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                        <Car className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
                      </div>
                      <p className="text-sm sm:text-base text-muted-foreground">
                        Vehicle information not available
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar - Order Summary */}
            <div className="space-y-4 lg:space-y-6">
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300 xl:sticky xl:top-6">
                <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
                  <CardTitle className="flex items-center gap-2 sm:gap-3 text-base sm:text-lg md:text-xl">
                    <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-r from-cyan-400/20 via-blue-500/20 to-purple-600/20">
                      <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    </div>
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6">
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm text-muted-foreground">Daily Rate</span>
                      <span className="text-sm sm:text-base text-foreground font-semibold">
                        {dumbCurrency(rental.car_posting?.price || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm text-muted-foreground">Duration</span>
                      <span className="text-sm sm:text-base text-foreground font-semibold">
                        {rental.days} days
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm text-muted-foreground">Subtotal</span>
                      <span className="text-sm sm:text-base text-foreground font-semibold">
                        {dumbCurrency(Number(rental.car_posting?.price || 0) * rental.days)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm text-muted-foreground">
                        Security Deposit
                      </span>
                      <span className="text-sm sm:text-base text-foreground font-semibold">
                        {dumbCurrency(Number(rental.deposit))}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm text-muted-foreground">
                        Additional Charges
                      </span>
                      <span className="text-sm sm:text-base text-foreground font-semibold">
                        {dumbCurrency(Number((rental as any)?.additional_charges || 0))}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm text-muted-foreground">
                        Refundable Amount
                      </span>
                      <span className="text-sm sm:text-base text-green-600 font-semibold">
                        {dumbCurrency(Number((rental as any)?.refundable_amount || 0))}
                      </span>
                    </div>
                  </div>

                  <Separator className="bg-border/50" />

                  <div className="p-3 sm:p-4 rounded-lg bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 backdrop-blur-sm">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2">
                      <span className="text-base sm:text-lg font-semibold text-foreground">
                        Total Amount
                      </span>
                      <span className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent break-all">
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

                      <div className="space-y-3 sm:space-y-4">
                        <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-muted-foreground">
                          <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                          Action Required
                        </div>

                        <div className="flex flex-col gap-2 sm:gap-3">
                          <Button
                            className="w-full h-10 sm:h-12 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] group text-sm sm:text-base"
                            onClick={() =>
                              confirm.confirm(
                                async () => await handleApproveRental(rental.id as number)
                              )
                            }
                          >
                            <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 group-hover:animate-pulse" />
                            Accept Booking
                          </Button>

                          <Button
                            variant="outline"
                            className="w-full h-10 sm:h-12 border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] group text-sm sm:text-base"
                            onClick={() =>
                              confirm.confirm(
                                async () => await handleRejectRental(rental.id as number)
                              )
                            }
                          >
                            <XCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 group-hover:animate-pulse" />
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
