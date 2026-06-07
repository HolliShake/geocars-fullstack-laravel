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
import { useFinishCarRental } from '@rest/car-rental.custom';
import { CarRentalRentalStatus, type CarRental, type UserRequirement } from '@rest/models';
import {
  AlertTriangle,
  Banknote,
  Building2,
  Calendar,
  CalendarDays,
  Car,
  CheckCircle,
  CheckCircle2,
  Clock,
  CreditCard,
  Eye,
  FileText,
  Flag,
  Fuel,
  Gauge,
  Hash,
  Mail,
  MapPin,
  Minus,
  Phone,
  Plus,
  Settings,
  Shield,
  TrendingUp,
  Upload,
  User,
  XCircle,
  Zap,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import type React from 'react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { toast } from 'sonner';

export default function UserCarRentalApplicationPage(): React.ReactElement {
  const { id } = useParams();

  const { data, isLoading, refetch: refetchRental } = useGetCarRentalById(Number(id));

  const rental = data?.data;

  const { mutateAsync: updateRental } = useUpdateCarRental();
  const { mutateAsync: finishRental, isPending: isFinishing } = useFinishCarRental();

  const confirm = useConfirm();

  const [days, setDays] = useState(rental?.days || 1);

  useEffect(() => {
    if (rental?.days) {
      setDays(rental.days);
    }
  }, [rental?.days]);

  const handleDaysChange = (newDays: number) => {
    if (newDays < 1) return;
    setDays(newDays);
  };

  const handleApproveRental = async (id: number) => {
    try {
      await updateRental({
        id,
        data: {
          ...rental,
          days: days,
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

  const handleFinishRental = async (id: number) => {
    try {
      const result = await finishRental({ id });
      const data = result?.data;
      if (data?.stripe_refund_id) {
        toast.success(
          `Rental completed! Stripe refund ₱${data.refundable_amount.toFixed(2)} issued (${data.stripe_refund_id}).`
        );
      } else if (data?.refundable_amount && data.refundable_amount > 0) {
        const payoutAcct = data.payout_account;
        const accountLabel = payoutAcct
          ? `${payoutAcct.type} ${payoutAcct.account_number}`
          : "the renter's account";
        toast.success(
          `Rental completed! Please send ₱${data.refundable_amount.toFixed(2)} to ${accountLabel}.`
        );
      } else {
        toast.success('Rental marked as completed.');
      }
      refetchRental();
    } catch {
      toast.error('Failed to finish rental');
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
        <div className="min-h-screen bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-purple-500/5">
          <div className="container mx-auto p-4 sm:p-6 max-w-7xl">
            <div className="space-y-4 sm:space-y-6">
              {/* Loading skeleton cards */}
              <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
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
        return 'bg-green-500/10 text-green-600 border-green-500/20 animate-pulse';
      case 'cancelled':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20 animate-pulse';
      case 'completed':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getDurationInDays = () => {
    const start = new Date(rental.car_posting?.start_date || rental.start_date);
    const end = new Date(rental.car_posting?.end_date || rental.start_date);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <PageLayout
      title="Car Rental Booking Request"
      description="View your car rental booking request details."
      withBack={true}
    >
      <div className="min-h-screen bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-purple-500/5">
        <div className="container mx-auto p-3 sm:p-4 md:p-6 max-w-7xl space-y-4 sm:space-y-6 lg:space-y-8">
          {/* Enhanced Header Section with Gradient Border */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 via-blue-500/20 to-purple-600/20 rounded-xl blur-xl" />
            <Card className="relative border-border/50 bg-card/80 backdrop-blur-sm shadow-lg">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="p-2 sm:p-2.5 rounded-xl bg-gradient-to-br from-cyan-400/20 via-blue-500/20 to-purple-600/20 backdrop-blur-sm shadow-lg">
                        <Hash className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                      </div>
                      <div>
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                          Booking #{rental.id}
                        </h1>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                          Submitted on {formatDate(rental.created_at || new Date().toISOString())}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={getStatusVariant(rental.rental_status)}
                      className={`w-fit gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium px-3 sm:px-4 py-1 sm:py-1.5 ${getStatusColor(rental.rental_status)}`}
                    >
                      {getStatusIcon(rental.rental_status)}
                      {rental.rental_status.charAt(0).toUpperCase() + rental.rental_status.slice(1)}
                    </Badge>
                  </div>

                  {/* Quick Stats */}
                  <div className="flex flex-wrap gap-3 sm:gap-4">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-purple-500/10 border border-border/50">
                      <Clock className="h-4 w-4 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">Duration</p>
                        <p className="text-sm font-semibold text-foreground">{days} days</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-purple-500/10 border border-border/50">
                      <CreditCard className="h-4 w-4 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">Total</p>
                        <p className="text-sm font-semibold text-foreground">
                          {dumbCurrency(
                            Number(rental.car_posting?.price || 0) * days +
                              Number(rental.deposit) +
                              Number((rental as any)?.additional_charges || 0)
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            {/* Main Content */}
            <div className="space-y-4 sm:space-y-4 lg:space-y-6 lg:min-w-0">
              {/* Enhanced Booking Information */}
              <Card className="border-border/50 bg-card/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 group">
                <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
                  <CardTitle className="flex items-center gap-2 sm:gap-3 text-base sm:text-lg md:text-xl">
                    <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-cyan-400/20 via-blue-500/20 to-purple-600/20 group-hover:scale-110 transition-transform duration-300">
                      <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    </div>
                    Booking Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="p-3 rounded-lg bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-purple-500/5 border border-border/50 hover:border-primary/30 transition-colors duration-200">
                      <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-muted-foreground mb-2">
                        <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                        Rental Duration
                      </div>
                      {rental.rental_status === CarRentalRentalStatus.pending ? (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-primary/20 hover:border-primary/40 hover:bg-gradient-to-br hover:from-cyan-500/20 hover:to-blue-500/20 transition-all duration-200"
                            onClick={() => handleDaysChange(days - 1)}
                            disabled={days <= 1}
                          >
                            <Minus className="h-4 w-4 text-primary" />
                          </Button>
                          <div className="flex-1 flex items-center justify-center px-4 py-2 rounded-lg bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-purple-500/10 border border-primary/20">
                            <span className="text-lg font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                              {days}
                            </span>
                            <span className="text-sm font-semibold text-muted-foreground ml-1">
                              days
                            </span>
                          </div>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-primary/20 hover:border-primary/40 hover:bg-gradient-to-br hover:from-cyan-500/20 hover:to-blue-500/20 transition-all duration-200"
                            onClick={() => handleDaysChange(days + 1)}
                          >
                            <Plus className="h-4 w-4 text-primary" />
                          </Button>
                        </div>
                      ) : (
                        <p className="text-sm sm:text-base text-foreground font-semibold">
                          {days} days
                        </p>
                      )}
                    </div>
                    <div className="p-3 rounded-lg bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-purple-500/5 border border-border/50 hover:border-primary/30 transition-colors duration-200">
                      <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-muted-foreground mb-1">
                        <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                        Pick-up Date
                      </div>
                      <p className="text-sm sm:text-base text-foreground font-semibold">
                        {new Date(rental.start_date).toLocaleDateString()}
                      </p>
                    </div>
                    {(rental.rental_status === CarRentalRentalStatus.confirmed ||
                      rental.rental_status === CarRentalRentalStatus.completed) && (
                      <div className="p-3 rounded-lg bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-purple-500/5 border border-border/50 hover:border-primary/30 transition-colors duration-200">
                        <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-muted-foreground mb-1">
                          <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                          Return Date
                        </div>
                        <p className="text-sm sm:text-base text-foreground font-semibold">
                          {rental.return_date
                            ? new Date(rental.return_date).toLocaleDateString()
                            : 'Not returned yet'}
                        </p>
                      </div>
                    )}
                    <div className="p-3 rounded-lg bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-purple-500/5 border border-border/50 hover:border-primary/30 transition-colors duration-200">
                      <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-muted-foreground mb-1">
                        <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                        Security Deposit
                      </div>
                      <p className="text-sm sm:text-base text-foreground font-semibold">
                        {dumbCurrency(Number(rental.deposit))}
                      </p>
                    </div>
                  </div>

                  <Separator className="bg-gradient-to-r from-transparent via-border to-transparent" />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="p-3 rounded-lg bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-purple-500/5 border border-border/50 hover:border-primary/30 transition-colors duration-200">
                      <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-muted-foreground mb-1">
                        <CreditCard className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                        Payment Method
                      </div>
                      <p className="text-sm sm:text-base text-foreground font-semibold capitalize">
                        {rental.payment_method}
                      </p>
                    </div>
                    {rental.payment_reference && (
                      <div className="p-3 rounded-lg bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-purple-500/5 border border-border/50 hover:border-primary/30 transition-colors duration-200">
                        <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-muted-foreground mb-1">
                          <Hash className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
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

              {/* Enhanced Customer Information */}
              <Card className="border-border/50 bg-card/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 group">
                <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
                  <CardTitle className="flex items-center gap-2 sm:gap-3 text-base sm:text-lg md:text-xl">
                    <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-cyan-400/20 via-blue-500/20 to-purple-600/20 group-hover:scale-110 transition-transform duration-300">
                      <User className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    </div>
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="p-3 rounded-lg bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-purple-500/5 border border-border/50 hover:border-primary/30 transition-colors duration-200">
                      <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-muted-foreground mb-1">
                        <User className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                        Name
                      </div>
                      <p className="text-sm sm:text-base text-foreground font-semibold break-words">
                        {rental.user?.name || 'N/A'}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-purple-500/5 border border-border/50 hover:border-primary/30 transition-colors duration-200">
                      <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-muted-foreground mb-1">
                        <Mail className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                        Email
                      </div>
                      <p className="text-sm sm:text-base text-foreground font-semibold break-all">
                        {rental.user?.email || 'N/A'}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-purple-500/5 border border-border/50 hover:border-primary/30 transition-colors duration-200">
                      <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-muted-foreground mb-1">
                        <Phone className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                        Phone
                      </div>
                      <p className="text-sm sm:text-base text-foreground font-semibold">
                        {rental.user?.phone || 'N/A'}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-purple-500/5 border border-border/50 hover:border-primary/30 transition-colors duration-200">
                      <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-muted-foreground mb-1">
                        <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                        Address
                      </div>
                      <p className="text-sm sm:text-base text-foreground font-semibold break-words">
                        {rental.user?.address || 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* Enhanced Requirements Section */}
                  {rental.user?.requirements && rental.user.requirements.length > 0 && (
                    <>
                      <Separator className="bg-gradient-to-r from-transparent via-border to-transparent" />
                      <div className="space-y-4 sm:space-y-6">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-cyan-400/20 via-blue-500/20 to-purple-600/20">
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
                                className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg hover:border-primary/30 transition-all duration-300"
                              >
                                <CardContent className="p-3 sm:p-4">
                                  <div className="space-y-3 sm:space-y-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                      <div className="flex items-center gap-2 sm:gap-3">
                                        <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-cyan-400/20 via-blue-500/20 to-purple-600/20 flex-shrink-0">
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
                                            ? 'bg-green-500/10 text-green-600 border-green-500/20'
                                            : 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20'
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

              {/* Enhanced Vehicle Information */}
              <Card className="border-border/50 bg-card/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 group">
                <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
                  <CardTitle className="flex items-center gap-2 sm:gap-3 text-base sm:text-lg md:text-xl">
                    <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-cyan-400/20 via-blue-500/20 to-purple-600/20 group-hover:scale-110 transition-transform duration-300">
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
                            <div className="relative group/img overflow-hidden rounded-xl bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-purple-500/10 p-1 shadow-lg">
                              <img
                                src={rental.car_posting.car.image_url}
                                alt={`${rental.car_posting.car?.brand || 'Unknown'} ${rental.car_posting.car?.model || 'Vehicle'}`}
                                className="w-full h-40 sm:h-48 md:h-56 lg:h-64 object-cover rounded-lg transition-transform duration-500 group-hover/img:scale-110"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 rounded-lg" />
                              <div className="absolute top-2 right-2 opacity-0 group-hover/img:opacity-100 transition-all duration-300 transform translate-y-2 group-hover/img:translate-y-0">
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  className="h-8 w-8 p-0 bg-card/90 hover:bg-card backdrop-blur-sm shadow-lg"
                                  onClick={() =>
                                    rental.car_posting?.car?.image_url &&
                                    window.open(rental.car_posting.car.image_url, '_blank')
                                  }
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="space-y-3 sm:space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            <div className="p-3 rounded-lg bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-purple-500/5 border border-border/50 hover:border-primary/30 transition-colors duration-200">
                              <span className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1.5 mb-1">
                                <Car className="h-3 w-3" />
                                Model
                              </span>
                              <p className="text-sm sm:text-base text-foreground font-semibold break-words">
                                {rental.car_posting.car?.brand || 'Unknown'}{' '}
                                {rental.car_posting.car?.model || 'Vehicle'}
                              </p>
                            </div>
                            <div className="p-3 rounded-lg bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-purple-500/5 border border-border/50 hover:border-primary/30 transition-colors duration-200">
                              <span className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1.5 mb-1">
                                <Calendar className="h-3 w-3" />
                                Year
                              </span>
                              <p className="text-sm sm:text-base text-foreground font-semibold">
                                {rental.car_posting.car?.year || 'N/A'}
                              </p>
                            </div>
                            <div className="p-3 rounded-lg bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-purple-500/5 border border-border/50 hover:border-primary/30 transition-colors duration-200">
                              <span className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1.5 mb-1">
                                <Hash className="h-3 w-3" />
                                License Plate
                              </span>
                              <p className="text-xs sm:text-sm text-foreground font-semibold font-mono bg-muted/50 px-2 py-1 rounded break-all">
                                {rental.car_posting.car?.plate_number || 'N/A'}
                              </p>
                            </div>
                            <div className="p-3 rounded-lg bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-purple-500/5 border border-border/50 hover:border-primary/30 transition-colors duration-200">
                              <span className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1.5 mb-1">
                                <Car className="h-3 w-3" />
                                Vehicle Type
                              </span>
                              <p className="text-sm sm:text-base text-foreground font-semibold capitalize">
                                {rental.car_posting.car?.type || 'N/A'}
                              </p>
                            </div>
                            <div className="p-3 rounded-lg bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-purple-500/5 border border-border/50 hover:border-primary/30 transition-colors duration-200">
                              <span className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1.5 mb-1">
                                <Settings className="h-3 w-3" />
                                Transmission
                              </span>
                              <p className="text-sm sm:text-base text-foreground font-semibold capitalize">
                                {rental.car_posting.car?.transmission || 'N/A'}
                              </p>
                            </div>
                            <div className="p-3 rounded-lg bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-purple-500/5 border border-border/50 hover:border-primary/30 transition-colors duration-200">
                              <span className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1.5 mb-1">
                                <Fuel className="h-3 w-3" />
                                Fuel Type
                              </span>
                              <p className="text-sm sm:text-base text-foreground font-semibold capitalize">
                                {rental.car_posting.car?.fuel_type || 'N/A'}
                              </p>
                            </div>
                          </div>
                          <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-purple-500/10 backdrop-blur-sm border border-primary/20 shadow-lg">
                            <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-muted-foreground mb-2">
                              <TrendingUp className="h-4 w-4 text-primary" />
                              Daily Rate
                            </div>
                            <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                              {dumbCurrency(rental.car_posting.price || 0)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Enhanced Engine Specifications */}
                      {(rental.car_posting.car?.engine_capacity ||
                        rental.car_posting.car?.engine_power ||
                        rental.car_posting.car?.engine_torque ||
                        rental.car_posting.car?.engine_type) && (
                        <>
                          <Separator className="bg-gradient-to-r from-transparent via-border to-transparent" />
                          <div className="space-y-3 sm:space-y-4">
                            <div className="flex items-center gap-2 sm:gap-3">
                              <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-cyan-400/20 via-blue-500/20 to-purple-600/20">
                                <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                              </div>
                              <h3 className="text-base sm:text-lg font-semibold text-foreground">
                                Engine Specifications
                              </h3>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                              {rental.car_posting.car?.engine_capacity && (
                                <div className="p-3 rounded-lg bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-purple-500/5 border border-border/50 hover:border-primary/30 hover:shadow-md transition-all duration-200">
                                  <div className="flex items-center gap-1.5 mb-1">
                                    <Gauge className="h-3 w-3 text-primary" />
                                    <span className="text-xs text-muted-foreground">Capacity</span>
                                  </div>
                                  <p className="text-sm font-semibold text-foreground">
                                    {rental.car_posting.car.engine_capacity}
                                  </p>
                                </div>
                              )}
                              {rental.car_posting.car?.engine_power && (
                                <div className="p-3 rounded-lg bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-purple-500/5 border border-border/50 hover:border-primary/30 hover:shadow-md transition-all duration-200">
                                  <div className="flex items-center gap-1.5 mb-1">
                                    <Zap className="h-3 w-3 text-primary" />
                                    <span className="text-xs text-muted-foreground">Power</span>
                                  </div>
                                  <p className="text-sm font-semibold text-foreground">
                                    {rental.car_posting.car.engine_power}
                                  </p>
                                </div>
                              )}
                              {rental.car_posting.car?.engine_torque && (
                                <div className="p-3 rounded-lg bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-purple-500/5 border border-border/50 hover:border-primary/30 hover:shadow-md transition-all duration-200">
                                  <div className="flex items-center gap-1.5 mb-1">
                                    <Settings className="h-3 w-3 text-primary" />
                                    <span className="text-xs text-muted-foreground">Torque</span>
                                  </div>
                                  <p className="text-sm font-semibold text-foreground">
                                    {rental.car_posting.car.engine_torque}
                                  </p>
                                </div>
                              )}
                              {rental.car_posting.car?.engine_type && (
                                <div className="p-3 rounded-lg bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-purple-500/5 border border-border/50 hover:border-primary/30 hover:shadow-md transition-all duration-200">
                                  <div className="flex items-center gap-1.5 mb-1">
                                    <Car className="h-3 w-3 text-primary" />
                                    <span className="text-xs text-muted-foreground">Type</span>
                                  </div>
                                  <p className="text-sm font-semibold text-foreground">
                                    {rental.car_posting.car.engine_type}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </>
                      )}

                      {/* Enhanced Rental Period Information */}
                      {(rental.car_posting.start_date || rental.car_posting.end_date) && (
                        <>
                          <Separator className="bg-gradient-to-r from-transparent via-border to-transparent" />
                          <div className="space-y-3 sm:space-y-4">
                            <div className="flex items-center gap-2 sm:gap-3">
                              <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-cyan-400/20 via-blue-500/20 to-purple-600/20">
                                <CalendarDays className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                              </div>
                              <h3 className="text-base sm:text-lg font-semibold text-foreground">
                                Availability Period
                              </h3>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                              {rental.car_posting.start_date && (
                                <div className="p-3 rounded-lg bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-purple-500/5 border border-border/50 hover:border-primary/30 hover:shadow-md transition-all duration-200">
                                  <div className="flex items-center gap-1.5 mb-1">
                                    <Calendar className="h-3 w-3 text-primary" />
                                    <span className="text-xs text-muted-foreground">
                                      Available From
                                    </span>
                                  </div>
                                  <p className="text-sm font-semibold text-foreground">
                                    {formatDate(rental.car_posting.start_date)}
                                  </p>
                                </div>
                              )}
                              {rental.car_posting.end_date && (
                                <div className="p-3 rounded-lg bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-purple-500/5 border border-border/50 hover:border-primary/30 hover:shadow-md transition-all duration-200">
                                  <div className="flex items-center gap-1.5 mb-1">
                                    <Calendar className="h-3 w-3 text-primary" />
                                    <span className="text-xs text-muted-foreground">
                                      Available Until
                                    </span>
                                  </div>
                                  <p className="text-sm font-semibold text-foreground">
                                    {formatDate(rental.car_posting.end_date)}
                                  </p>
                                </div>
                              )}
                              {rental.car_posting.start_date && rental.car_posting.end_date && (
                                <div className="p-3 rounded-lg bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-purple-500/5 border border-border/50 hover:border-primary/30 hover:shadow-md transition-all duration-200">
                                  <div className="flex items-center gap-1.5 mb-1">
                                    <Clock className="h-3 w-3 text-primary" />
                                    <span className="text-xs text-muted-foreground">
                                      Total Period
                                    </span>
                                  </div>
                                  <p className="text-sm font-semibold text-foreground">
                                    {getDurationInDays()} days
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </>
                      )}

                      {/* Enhanced Company Information */}
                      {rental.car_posting.car?.user_company && (
                        <>
                          <Separator className="bg-gradient-to-r from-transparent via-border to-transparent" />
                          <div className="space-y-3 sm:space-y-4">
                            <div className="flex items-center gap-2 sm:gap-3">
                              <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-cyan-400/20 via-blue-500/20 to-purple-600/20">
                                <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                              </div>
                              <h3 className="text-base sm:text-lg font-semibold text-foreground">
                                Rental Company
                              </h3>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                              <div className="p-3 rounded-lg bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-purple-500/5 border border-border/50 hover:border-primary/30 transition-colors duration-200">
                                <span className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1.5 mb-1">
                                  <Building2 className="h-3 w-3" />
                                  Company Name
                                </span>
                                <p className="text-sm sm:text-base text-foreground font-semibold break-words">
                                  {rental.car_posting.car.user_company.name}
                                </p>
                              </div>
                              <div className="p-3 rounded-lg bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-purple-500/5 border border-border/50 hover:border-primary/30 transition-colors duration-200">
                                <span className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1.5 mb-1">
                                  <MapPin className="h-3 w-3" />
                                  Location
                                </span>
                                <p className="text-sm sm:text-base text-foreground font-semibold break-words">
                                  {rental.car_posting.car.user_company.city},{' '}
                                  {rental.car_posting.car.user_company.country}
                                </p>
                              </div>
                              <div className="p-3 rounded-lg bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-purple-500/5 border border-border/50 hover:border-primary/30 transition-colors duration-200">
                                <span className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1.5 mb-1">
                                  <MapPin className="h-3 w-3" />
                                  Address
                                </span>
                                <p className="text-sm sm:text-base text-foreground font-semibold break-words">
                                  {rental.car_posting.car.user_company.address}
                                </p>
                              </div>
                              <div className="p-3 rounded-lg bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-purple-500/5 border border-border/50 hover:border-primary/30 transition-colors duration-200">
                                <span className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1.5 mb-1">
                                  <Hash className="h-3 w-3" />
                                  Postal Code
                                </span>
                                <p className="text-sm sm:text-base text-foreground font-semibold">
                                  {rental.car_posting.car.user_company.postal_code}
                                </p>
                              </div>
                            </div>
                          </div>
                        </>
                      )}

                      {rental.car_posting.description && (
                        <>
                          <Separator className="bg-gradient-to-r from-transparent via-border to-transparent" />
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-primary" />
                              <span className="text-sm font-medium text-muted-foreground">
                                Description
                              </span>
                            </div>
                            <div
                              className="text-xs sm:text-sm text-foreground leading-relaxed p-3 rounded-lg bg-muted/30"
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

            {/* Enhanced Sidebar - Rental Details with Sticky */}
            <div className="lg:block">
              <div className="sticky top-4 lg:top-6 space-y-4 lg:space-y-6 h-fit max-h-[calc(100vh-2rem)] overflow-auto">
                <Card className="border-border/50 bg-card/90 backdrop-blur-md hover:shadow-xl transition-all duration-300 shadow-lg">
                  <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
                    <CardTitle className="flex items-center gap-2 sm:gap-3 text-base sm:text-lg md:text-xl">
                      <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-cyan-400/20 via-blue-500/20 to-purple-600/20">
                        <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                      </div>
                      Order Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-2 rounded-lg hover:bg-muted/30 transition-colors duration-200">
                        <span className="text-xs sm:text-sm text-muted-foreground">Daily Rate</span>
                        <span className="text-sm sm:text-base text-foreground font-semibold">
                          {dumbCurrency(rental.car_posting?.price || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-2 rounded-lg hover:bg-muted/30 transition-colors duration-200">
                        <span className="text-xs sm:text-sm text-muted-foreground">Duration</span>
                        <span className="text-sm sm:text-base text-foreground font-semibold">
                          {days} days
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-2 rounded-lg hover:bg-muted/30 transition-colors duration-200">
                        <span className="text-xs sm:text-sm text-muted-foreground">Subtotal</span>
                        <span className="text-sm sm:text-base text-foreground font-semibold">
                          {dumbCurrency(Number(rental.car_posting?.price || 0) * days)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-2 rounded-lg hover:bg-muted/30 transition-colors duration-200">
                        <span className="text-xs sm:text-sm text-muted-foreground">
                          Security Deposit
                        </span>
                        <span className="text-sm sm:text-base text-foreground font-semibold">
                          {dumbCurrency(Number(rental.deposit))}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-2 rounded-lg hover:bg-muted/30 transition-colors duration-200">
                        <span className="text-xs sm:text-sm text-muted-foreground">
                          Additional Charges
                        </span>
                        <span className="text-sm sm:text-base text-foreground font-semibold">
                          {dumbCurrency(Number((rental as any)?.additional_charges || 0))}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-2 rounded-lg hover:bg-green-500/5 transition-colors duration-200">
                        <span className="text-xs sm:text-sm text-muted-foreground">
                          Refundable Amount
                        </span>
                        <span className="text-sm sm:text-base text-green-600 font-semibold">
                          {dumbCurrency(Number((rental as any)?.refundable_amount || 0))}
                        </span>
                      </div>
                    </div>

                    <Separator className="bg-gradient-to-r from-transparent via-border to-transparent" />

                    <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-purple-500/10 backdrop-blur-sm border border-primary/20 shadow-lg">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                        <span className="text-base sm:text-lg font-semibold text-foreground">
                          Total Amount
                        </span>
                        <span className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                          {dumbCurrency(
                            Number(rental.car_posting?.price || 0) * days +
                              Number(rental.deposit) +
                              Number((rental as any)?.additional_charges || 0)
                          )}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {rental.rental_status === CarRentalRentalStatus.pending && (
                  <Card className="border-border/50 bg-card/90 backdrop-blur-md hover:shadow-xl transition-all duration-300 shadow-lg">
                    <CardContent className="p-4 sm:p-6 space-y-3 sm:space-y-4">
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
                          className="w-full h-10 sm:h-12 border-2 border-destructive/20 text-destructive hover:bg-destructive/10 hover:border-destructive/30 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] group text-sm sm:text-base"
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

                      <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                        <p className="text-xs text-muted-foreground text-center">
                          Please review all details carefully before making a decision
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {rental.rental_status === CarRentalRentalStatus.confirmed && (
                  <Card className="border-border/50 bg-card/90 backdrop-blur-md hover:shadow-xl transition-all duration-300 shadow-lg">
                    <CardContent className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                      <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-muted-foreground">
                        <Flag className="h-3 w-3 sm:h-4 sm:w-4" />
                        Complete Rental
                      </div>

                      {/* QR Code for mobile binding */}
                      <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-purple-500/10 border border-primary/20">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Scan to bind mobile app
                        </p>
                        <div className="p-3 bg-white rounded-lg shadow-md">
                          <QRCodeSVG
                            value={JSON.stringify({
                              car_rental_id: rental.id,
                              user_id: rental.user_id,
                            })}
                            size={160}
                            level="M"
                            includeMargin={false}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground text-center">
                          Rental #{rental.id} · User #{rental.user_id}
                        </p>
                      </div>

                      {/* Cash debt notice */}
                      {(rental as any)?.cash_debt != null && (
                        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-3 space-y-1">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600">
                            <Banknote className="h-3.5 w-3.5" />
                            Cash Payment — Outstanding Debt
                          </div>
                          <div className="flex justify-between items-center text-xs sm:text-sm">
                            <span className="text-muted-foreground">Amount owed (cash)</span>
                            <span className="font-bold text-amber-600">
                              {dumbCurrency(Number((rental as any).cash_debt))}
                            </span>
                          </div>
                          {(rental as any)?.cash_debt_settled && (
                            <Badge className="bg-green-500/20 text-green-700 border-green-500/30 text-xs">
                              Settled
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Refund / payout preview */}
                      <div className="rounded-lg border border-border/50 bg-muted/30 divide-y divide-border/40">
                        <div className="flex justify-between items-center px-3 py-2 text-xs sm:text-sm">
                          <span className="text-muted-foreground">Scheduled return</span>
                          <span className="font-semibold">
                            {new Date(
                              new Date(rental.start_date).getTime() + days * 24 * 60 * 60 * 1000
                            ).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center px-3 py-2 text-xs sm:text-sm">
                          <span className="text-muted-foreground">Est. refundable</span>
                          <span className="font-semibold text-green-600">
                            {dumbCurrency(Number((rental as any)?.refundable_amount || 0))}
                          </span>
                        </div>
                        {Number((rental as any)?.additional_charges || 0) > 0 && (
                          <div className="flex justify-between items-center px-3 py-2 text-xs sm:text-sm">
                            <span className="text-muted-foreground">Additional charges</span>
                            <span className="font-semibold text-destructive">
                              {dumbCurrency(Number((rental as any)?.additional_charges || 0))}
                            </span>
                          </div>
                        )}
                      </div>

                      <Button
                        className="w-full h-10 sm:h-12 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] group text-sm sm:text-base"
                        disabled={isFinishing}
                        onClick={() =>
                          confirm.confirm(async () => await handleFinishRental(rental.id as number))
                        }
                      >
                        <Banknote className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 group-hover:animate-pulse" />
                        {isFinishing ? 'Processing...' : 'Finish & Return Car'}
                      </Button>

                      <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                        <p className="text-xs text-muted-foreground text-center">
                          Marks the car as returned now. Eligible refunds are automatically sent to
                          the renter's registered account.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
