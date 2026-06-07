import { useConfirm } from '@/components/confirm.provider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { dumbCurrency } from '@/lib/dumb-currency';
import { RouteKey } from '@/navigation/route';
import { useGetCarRentalPaginated, useUpdateCarRental } from '@rest/api';
import { CarRentalRentalStatus, type CarRental } from '@rest/models';
import { CalendarClock, Car, CreditCard, ReceiptText } from 'lucide-react';
import type React from 'react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

type StatusFilter =
  | 'all'
  | typeof CarRentalRentalStatus.pending
  | typeof CarRentalRentalStatus.confirmed
  | typeof CarRentalRentalStatus.completed
  | typeof CarRentalRentalStatus.cancelled
  | typeof CarRentalRentalStatus.rejected;

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

function RentalCardSkeleton() {
  return (
    <div className="space-y-3 rounded-xl border p-4">
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-9 w-28" />
    </div>
  );
}

export default function RenterRentalHistoryPage(): React.ReactNode {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const {
    data,
    isPending: isLoading,
    refetch,
  } = useGetCarRentalPaginated({
    page,
    rows,
    search: search || undefined,
  });

  const { mutateAsync: updateRental, isPending: isUpdating } = useUpdateCarRental();
  const confirm = useConfirm();

  const rentals = useMemo(() => data?.data?.data ?? [], [data?.data?.data]);

  const filteredRentals = useMemo(() => {
    if (statusFilter === 'all') return rentals;
    return rentals.filter((rental) => rental.rental_status === statusFilter);
  }, [statusFilter, rentals]);

  const summary = useMemo(() => {
    const pending = rentals.filter((r) => r.rental_status === CarRentalRentalStatus.pending).length;
    const active = rentals.filter(
      (r) =>
        r.rental_status === CarRentalRentalStatus.pending ||
        r.rental_status === CarRentalRentalStatus.confirmed
    ).length;
    const past = rentals.length - active;
    return { pending, active, past };
  }, [rentals]);

  const transactionRows = useMemo(
    () =>
      rentals
        .map((rental) => {
          const dailyPrice = Number(rental.car_posting?.price ?? 0);
          const base = dailyPrice * Number(rental.days ?? 0);
          const deposit = Number(rental.deposit ?? 0);

          return {
            id: rental.id,
            created_at: rental.created_at,
            amount: base + deposit,
            payment_method: rental.payment_method ?? 'N/A',
            rental_status: rental.rental_status,
            vehicle:
              `${rental.car_posting?.car?.brand ?? 'Car'} ${rental.car_posting?.car?.model ?? ''}`.trim(),
          };
        })
        .sort((a, b) => {
          const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
          const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
          return bTime - aTime;
        }),
    [rentals]
  );

  const totalItems = data?.data?.total ?? rentals.length;
  const lastPage = data?.data?.last_page ?? 1;

  const handleCancelPending = async (rental: CarRental) => {
    if (!rental.id) return;

    confirm.confirm(
      async () => {
        try {
          await updateRental({
            id: rental.id,
            data: {
              ...rental,
              rental_status: CarRentalRentalStatus.cancelled,
            },
          });
          toast.success('Pending rental was cancelled.');
          refetch();
        } catch {
          toast.error('Failed to cancel rental. Please try again.');
        }
      },
      'Cancel Rental Request?',
      'This will cancel your pending rental request. This action cannot be undone.'
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-2xl border bg-card/80 p-5 shadow-sm backdrop-blur-sm sm:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">My Rentals and Payments</h1>
              <p className="text-sm text-muted-foreground">
                Track your booking status and payment records in one place.
              </p>
            </div>
            <div className="flex w-full flex-col gap-2 sm:flex-row md:w-auto">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by car brand or model"
                className="sm:w-64"
              />
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as StatusFilter)}
              >
                <SelectTrigger className="w-full sm:w-56">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value={CarRentalRentalStatus.pending}>Pending</SelectItem>
                  <SelectItem value={CarRentalRentalStatus.confirmed}>Confirmed</SelectItem>
                  <SelectItem value={CarRentalRentalStatus.completed}>Completed</SelectItem>
                  <SelectItem value={CarRentalRentalStatus.cancelled}>Cancelled</SelectItem>
                  <SelectItem value={CarRentalRentalStatus.rejected}>Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-lg border bg-background/60 px-3 py-2">
              <p className="text-xs text-muted-foreground">Active rentals</p>
              <p className="text-lg font-semibold">{summary.active}</p>
            </div>
            <div className="rounded-lg border bg-background/60 px-3 py-2">
              <p className="text-xs text-muted-foreground">Pending requests</p>
              <p className="text-lg font-semibold">{summary.pending}</p>
            </div>
            <div className="rounded-lg border bg-background/60 px-3 py-2">
              <p className="text-xs text-muted-foreground">Past rentals</p>
              <p className="text-lg font-semibold">{summary.past}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                Rental Records
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoading ? (
                <>
                  <RentalCardSkeleton />
                  <RentalCardSkeleton />
                  <RentalCardSkeleton />
                </>
              ) : filteredRentals.length === 0 ? (
                <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                  No rentals found for the selected status.
                </p>
              ) : (
                filteredRentals.map((rental) => {
                  const dailyPrice = Number(rental.car_posting?.price ?? 0);
                  const total = dailyPrice * Number(rental.days ?? 0) + Number(rental.deposit ?? 0);

                  return (
                    <div
                      key={rental.id}
                      role="button"
                      tabIndex={0}
                      className="rounded-xl border p-4 sm:p-5 cursor-pointer transition-colors hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                      onClick={() =>
                        rental.id && navigate(RouteKey.Renter.RentalDetail.parse(rental.id))
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          if (rental.id) navigate(RouteKey.Renter.RentalDetail.parse(rental.id));
                        }
                      }}
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="space-y-1">
                          <p className="text-base font-semibold">
                            {rental.car_posting?.car?.brand ?? 'Car'}{' '}
                            {rental.car_posting?.car?.model ?? ''}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Plate: {rental.car_posting?.car?.plate_number ?? 'N/A'}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                            <span className="inline-flex items-center gap-1">
                              <CalendarClock className="h-4 w-4" />
                              Start:{' '}
                              {new Date(rental.start_date).toLocaleDateString('en-PH', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                            <span>•</span>
                            <span>{rental.days} day(s)</span>
                          </div>
                        </div>

                        <div className="flex flex-col items-start gap-2 sm:items-end">
                          <RentalStatusBadge status={rental.rental_status} />
                          <p className="text-sm font-medium">{dumbCurrency(total)}</p>
                          {rental.rental_status === CarRentalRentalStatus.pending && (
                            <Button
                              variant="destructive"
                              size="sm"
                              disabled={isUpdating}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCancelPending(rental);
                              }}
                            >
                              Cancel
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}

              <Separator />

              <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                <p className="text-sm text-muted-foreground">
                  Showing {filteredRentals.length} of {totalItems} records
                </p>
                <div className="flex items-center gap-2">
                  <Select value={String(rows)} onValueChange={(value) => setRows(Number(value))}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">{page}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= lastPage}
                    onClick={() => setPage((prev) => prev + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ReceiptText className="h-5 w-5" />
                Payment Snapshot
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Amounts below are derived from each rental (daily rate x days + deposit).
              </p>
              {isLoading ? (
                <>
                  <RentalCardSkeleton />
                  <RentalCardSkeleton />
                </>
              ) : transactionRows.length === 0 ? (
                <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                  No payment records yet.
                </p>
              ) : (
                transactionRows.map((tx) => (
                  <div
                    key={tx.id}
                    role="button"
                    tabIndex={0}
                    className="rounded-xl border p-4 cursor-pointer transition-colors hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                    onClick={() => tx.id && navigate(RouteKey.Renter.RentalDetail.parse(tx.id))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        if (tx.id) navigate(RouteKey.Renter.RentalDetail.parse(tx.id));
                      }
                    }}
                  >
                    <p className="text-sm font-semibold">#{tx.id}</p>
                    <p className="text-sm text-muted-foreground">{tx.vehicle}</p>
                    <div className="mt-2 flex items-center justify-between text-sm">
                      <span className="inline-flex items-center gap-1 text-muted-foreground">
                        <CreditCard className="h-4 w-4" />
                        {String(tx.payment_method).toUpperCase()}
                      </span>
                      <RentalStatusBadge status={tx.rental_status} />
                    </div>
                    <p className="mt-2 text-sm font-medium">{dumbCurrency(tx.amount)}</p>
                    <p className="text-xs text-muted-foreground">
                      {tx.created_at
                        ? new Date(tx.created_at).toLocaleDateString('en-PH', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })
                        : 'No date'}
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
