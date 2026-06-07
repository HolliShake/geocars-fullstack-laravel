/* eslint-disable react-hooks/exhaustive-deps */
import { useConfirm } from '@/components/confirm.provider';
import Table, { type TableColumn } from '@/components/custom/table.component';
import PageLayout from '@/components/layout/page.layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { dumbCurrency } from '@/lib/dumb-currency';
import { getError } from '@/lib/error';
import useSearchStore from '@/store/search.store';
import { useCollectCarRentalDebt, useGetPendingDebtCarRentals } from '@rest/car-rental-debt.custom';
import type { CarRental } from '@rest/models/carRental';
import { LucideBanknote, LucideCheckCircle2 } from 'lucide-react';
import React, { useMemo } from 'react';
import { toast } from 'sonner';
import { useDebounce } from 'use-debounce';

export default function AdminDebtCollectionPage(): React.ReactElement {
  const { searchQuery } = useSearchStore();
  const [debounced] = useDebounce(searchQuery, 300);
  const [page, setPage] = React.useState(1);
  const [rows, setRows] = React.useState(10);

  const {
    data,
    isPending: isLoading,
    refetch,
  } = useGetPendingDebtCarRentals({
    search: debounced,
    page,
    rows,
  });

  const { mutateAsync: collectDebt, isPending: isCollecting } = useCollectCarRentalDebt();
  const confirm = useConfirm();

  const handleCollect = async (rental: CarRental) => {
    confirm.confirm(async () => {
      try {
        const result = await collectDebt({ id: rental.id! });
        const payload = result.data;
        const account = payload.collected_from_account;
        const accountText = `${account.type} ${account.account_number}`;

        toast.success(
          `Collected ${dumbCurrency(payload.collected_amount)} from renter account (${accountText}).`
        );
        refetch();
      } catch (error) {
        const fallback =
          error instanceof Error
            ? error.message
            : 'Failed to collect pending debt for this rental.';
        const parsed = getError(error);
        const firstMessage = Object.values(parsed)[0]?.[0] ?? fallback;
        toast.error(firstMessage);
      }
    });
  };

  const columns = useMemo<TableColumn[]>(
    () => [
      {
        key: 'id',
        label: 'Rental #',
        align: 'left',
      },
      {
        key: 'user.name',
        label: 'Renter',
        align: 'left',
      },
      {
        key: 'car_posting.car.user_company.name',
        label: 'Company',
        align: 'left',
      },
      {
        key: 'car_posting.car.user_company.user_id',
        label: 'Company Owner ID',
        align: 'center',
      },
      {
        key: 'cash_debt',
        label: 'Pending Debt',
        align: 'right',
        render: (value) => (
          <span className="font-semibold">{dumbCurrency(Number(value || 0))}</span>
        ),
      },
      {
        key: 'payment_method',
        label: 'Payment',
        align: 'center',
        render: (value) => <Badge variant="outline">{String(value ?? '').toUpperCase()}</Badge>,
      },
      {
        key: 'cash_debt_settled',
        label: 'Settled',
        align: 'center',
        render: (value) =>
          value ? (
            <Badge className="bg-green-600 hover:bg-green-600 text-white">Yes</Badge>
          ) : (
            <Badge variant="secondary">No</Badge>
          ),
      },
      {
        key: 'actions',
        label: 'Actions',
        align: 'center',
        render: (_, row) => {
          const debt = Number((row as CarRental).cash_debt ?? 0);
          const isSettled = Boolean((row as CarRental).cash_debt_settled);
          const disabled = isSettled || debt <= 0 || isCollecting;

          return (
            <Button
              size="sm"
              variant={disabled ? 'outline' : 'default'}
              disabled={disabled}
              onClick={() => handleCollect(row as CarRental)}
            >
              {isSettled ? (
                <>
                  <LucideCheckCircle2 className="h-4 w-4 mr-1" />
                  Collected
                </>
              ) : (
                <>
                  <LucideBanknote className="h-4 w-4 mr-1" />
                  Collect
                </>
              )}
            </Button>
          );
        },
      },
    ],
    [isCollecting]
  );

  const items = useMemo(() => {
    if (!data?.data?.data) return [];
    return data.data.data.map((item) => item as CarRental);
  }, [data]);

  const totalItems = useMemo(() => {
    if (!data?.data) return 1;
    return data.data.total ?? data.data.data?.length ?? 1;
  }, [data]);

  return (
    <PageLayout
      title="Debt Collection"
      description="Monitor pending cash debts and trigger renter account collection."
    >
      <Table
        isLoading={isLoading}
        columns={columns}
        data={items}
        page={page}
        pageSize={rows}
        totalItems={totalItems}
        onPageChange={setPage}
        onPageSizeChange={setRows}
      />
    </PageLayout>
  );
}
