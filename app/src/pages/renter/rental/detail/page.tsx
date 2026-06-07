import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { dumbCurrency } from '@/lib/dumb-currency';
import { useGetCarRentalById } from '@rest/api';
import { CarRentalRentalStatus } from '@rest/models';
import {
  ArrowLeft,
  Building2,
  Calendar,
  CalendarDays,
  Car,
  CheckCircle2,
  Clock,
  CreditCard,
  Hash,
  Mail,
  Phone,
  Shield,
  User,
  XCircle,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import type React from 'react';
import { useNavigate, useParams } from 'react-router';

function RentalStatusBadge({ status }: { status: string }) {
  if (status === CarRentalRentalStatus.pending) {
    return <Badge variant="secondary">Pending</Badge>;
  }
  if (status === CarRentalRentalStatus.confirmed) {
    return <Badge className="bg-blue-600 hover:bg-blue-600 text-white">Confirmed</Badge>;
  }
  if (status === CarRentalRentalStatus.completed) {
    return <Badge className="bg-green-600 hover:bg-green-600 text-white">Completed</Badge>;
  }
  if (status === CarRentalRentalStatus.cancelled) {
    return <Badge variant="destructive">Cancelled</Badge>;
  }
  if (status === CarRentalRentalStatus.rejected) {
    return <Badge variant="outline">Rejected</Badge>;
  }
  return <Badge variant="outline">{status}</Badge>;
}

function LoadingState() {
  return (
    <div className="mx-auto max-w-5xl space-y-4 px-4 py-6 sm:px-6 lg:px-8">
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-56" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

function formatDate(date?: string | null) {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function getStatusMessage(status: string) {
  if (status === CarRentalRentalStatus.pending) {
    return 'Your booking request is waiting for host approval.';
  }
  if (status === CarRentalRentalStatus.confirmed) {
    return 'Your booking is confirmed. Keep this page for payment and trip details.';
  }
  if (status === CarRentalRentalStatus.completed) {
    return 'This rental has been completed successfully.';
  }
  if (status === CarRentalRentalStatus.cancelled) {
    return 'This booking was cancelled.';
  }
  if (status === CarRentalRentalStatus.rejected) {
    return 'This booking request was rejected by the host.';
  }
  return 'Booking status is available below.';
}

function getStatusIcon(status: string) {
  if (status === CarRentalRentalStatus.completed || status === CarRentalRentalStatus.confirmed) {
    return <CheckCircle2 className="h-4 w-4 text-green-600" />;
  }
  if (status === CarRentalRentalStatus.cancelled || status === CarRentalRentalStatus.rejected) {
    return <XCircle className="h-4 w-4 text-destructive" />;
  }
  return <Clock className="h-4 w-4 text-amber-600" />;
}

export default function RenterRentalDetailPage(): React.ReactNode {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const rentalId = Number(id);

  const { data, isLoading } = useGetCarRentalById(rentalId, {
    query: { enabled: Number.isFinite(rentalId) && rentalId > 0 },
  });

  const rental = data?.data;

  if (isLoading) {
    return <LoadingState />;
  }

  if (!rental) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <Card>
          <CardContent className="p-6 text-center text-sm text-muted-foreground">
            Rental details not found.
          </CardContent>
        </Card>
      </div>
    );
  }

  const dailyRate = Number(rental.car_posting?.price ?? 0);
  const subtotal = dailyRate * Number(rental.days ?? 0);
  const deposit = Number(rental.deposit ?? 0);
  const additionalCharges = Number(rental.additional_charges ?? 0);
  const refundableAmount = Number(rental.refundable_amount ?? 0);
  const total = subtotal + deposit + additionalCharges;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <Button variant="outline" onClick={() => navigate(-1)} className="w-fit">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <Card className="border-border/50 bg-card/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-2">
                <Hash className="h-5 w-5" />
                Rental #{rental.id}
              </span>
              <RentalStatusBadge status={rental.rental_status} />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-4">
              <div className="rounded-lg border bg-background/60 p-3">
                <p className="text-xs text-muted-foreground">Start Date</p>
                <p className="text-sm font-semibold">{formatDate(rental.start_date)}</p>
              </div>
              <div className="rounded-lg border bg-background/60 p-3">
                <p className="text-xs text-muted-foreground">Duration</p>
                <p className="text-sm font-semibold">{rental.days} day(s)</p>
              </div>
              <div className="rounded-lg border bg-background/60 p-3">
                <p className="text-xs text-muted-foreground">Return Date</p>
                <p className="text-sm font-semibold">{formatDate(rental.return_date)}</p>
              </div>
              <div className="rounded-lg border bg-background/60 p-3">
                <p className="text-xs text-muted-foreground">Total Amount</p>
                <p className="text-sm font-semibold">{dumbCurrency(total)}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
              {getStatusIcon(rental.rental_status)}
              <span>{getStatusMessage(rental.rental_status)}</span>
            </div>

            {rental.rental_status === CarRentalRentalStatus.confirmed && (
              <div className="space-y-2 rounded-lg border border-primary/20 bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-purple-500/10 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Scan to bind mobile app
                </p>
                <div className="flex justify-center rounded-lg bg-white p-3 shadow-sm">
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
                <p className="text-center text-xs text-muted-foreground">
                  Rental #{rental.id} · User #{rental.user_id}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Car className="h-4 w-4" />
                Car Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>
                <span className="text-muted-foreground">Vehicle:</span>{' '}
                <span className="font-semibold">
                  {rental.car_posting?.car?.brand ?? 'Car'} {rental.car_posting?.car?.model ?? ''}
                </span>
              </p>
              <p>
                <span className="text-muted-foreground">Plate:</span>{' '}
                <span className="font-semibold">
                  {rental.car_posting?.car?.plate_number ?? 'N/A'}
                </span>
              </p>
              <p>
                <span className="text-muted-foreground">Type:</span>{' '}
                <span className="font-semibold capitalize">
                  {rental.car_posting?.car?.type ?? 'N/A'}
                </span>
              </p>
              <p>
                <span className="text-muted-foreground">Daily Rate:</span>{' '}
                <span className="font-semibold">{dumbCurrency(dailyRate)}</span>
              </p>
              <p>
                <span className="text-muted-foreground">Available Window:</span>{' '}
                <span className="font-semibold">
                  {formatDate(rental.car_posting?.start_date)} -{' '}
                  {formatDate(rental.car_posting?.end_date)}
                </span>
              </p>
              {rental.car_posting?.car?.image_url && (
                <div className="overflow-hidden rounded-lg border">
                  <img
                    src={rental.car_posting.car.image_url}
                    alt={`${rental.car_posting?.car?.brand ?? 'Car'} ${rental.car_posting?.car?.model ?? ''}`}
                    className="h-48 w-full object-cover"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="h-4 w-4" />
                Contact and Host
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>
                <span className="text-muted-foreground">Name:</span>{' '}
                <span className="font-semibold">{rental.user?.name ?? 'N/A'}</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="font-semibold">{rental.user?.email ?? 'N/A'}</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="font-semibold">{rental.user?.phone ?? 'N/A'}</span>
              </p>
              <Separator />
              <p className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="font-semibold">
                  {rental.car_posting?.car?.user_company?.name ?? 'Host N/A'}
                </span>
              </p>
              <p>
                <span className="text-muted-foreground">Host Location:</span>{' '}
                <span className="font-semibold">
                  {rental.car_posting?.car?.user_company?.city ?? 'N/A'},{' '}
                  {rental.car_posting?.car?.user_company?.country ?? 'N/A'}
                </span>
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CreditCard className="h-4 w-4" />
              Payment and Booking Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal ({rental.days} day(s))</span>
              <span className="font-semibold">{dumbCurrency(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Deposit</span>
              <span className="font-semibold">{dumbCurrency(deposit)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Additional Charges</span>
              <span className="font-semibold">{dumbCurrency(additionalCharges)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Payment Method</span>
              <span className="font-semibold uppercase">{rental.payment_method ?? 'N/A'}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Refundable Amount</span>
              <span className="font-semibold text-green-600">{dumbCurrency(refundableAmount)}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold">Total</span>
              <span className="font-bold">{dumbCurrency(total)}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                Created
              </span>
              <span>{formatDate(rental.created_at)}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5" />
                Updated
              </span>
              <span>{formatDate(rental.updated_at)}</span>
            </div>
            {rental.payment_reference && (
              <div className="rounded-md border bg-muted/40 p-2 text-xs">
                <span className="text-muted-foreground">Reference: </span>
                <span className="font-mono">{rental.payment_reference}</span>
              </div>
            )}
            <div className="flex items-center gap-2 rounded-md border bg-muted/30 p-2 text-xs text-muted-foreground">
              <Shield className="h-3.5 w-3.5" />
              This is a brief snapshot of this rental, similar to the booking detail summary.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
