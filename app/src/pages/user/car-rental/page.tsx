/* eslint-disable react-hooks/exhaustive-deps */
import { useConfirm } from '@/components/confirm.provider';
import { Menu } from '@/components/custom/menu.component';
import Table, { type TableColumn } from '@/components/custom/table.component';
import PageLayout from '@/components/layout/page.layout';
import { Badge } from '@/components/ui/badge';
import { dumbCurrency } from '@/lib/dumb-currency';
import { RouteKey } from '@/navigation/route';
import useCompanyStore from '@/store/company.store';
import useSearchStore from '@/store/search.store';
import { useDeleteCarRental, useGetCarRentalPaginated } from '@rest/api';
import type { CarRental } from '@rest/models/carRental';
import { LucideEye, LucideTrash2 } from 'lucide-react';
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { useDebounce } from 'use-debounce';

export default function UserCarRentalPage(): React.ReactElement {
  const { selectedCompany } = useCompanyStore();
  const { searchQuery } = useSearchStore();
  const [debounced] = useDebounce(searchQuery, 300);
  const [page, setPage] = React.useState(1);
  const [rows, setRows] = React.useState(10);
  const { data, isPending: isLoading } = useGetCarRentalPaginated(
    {
      search: debounced,
      page,
      rows,
      company_id: selectedCompany?.id,
    },
    {
      query: {
        enabled: !!selectedCompany?.id,
      },
    }
  );

  const { mutateAsync: deleteCarRental } = useDeleteCarRental();

  const confirm = useConfirm();

  const navigate = useNavigate();

  const columns = useMemo<TableColumn[]>(
    () => [
      {
        key: 'id',
        label: 'ID',
        align: 'left',
      },
      {
        key: 'user.name',
        label: 'Renter',
        align: 'left',
      },
      {
        key: 'car_posting.car.brand',
        label: 'Car Brand',
        align: 'left',
      },
      {
        key: 'car_posting.car.model',
        label: 'Car Model',
        align: 'left',
      },
      {
        key: 'car_posting.car.plate_number',
        label: 'Car Plate Number',
        align: 'left',
      },
      {
        key: 'days',
        label: 'Days',
        align: 'center',
      },
      {
        key: 'deposit',
        label: 'Deposit',
        align: 'center',
        render: (value) => dumbCurrency(value),
      },
      {
        key: 'start_date',
        label: 'Start Date',
        align: 'center',
        render: (value) => new Date(value).toLocaleDateString(),
      },
      {
        key: 'return_date',
        label: 'Return Date',
        align: 'center',
        render: (value) => (value ? new Date(value).toLocaleDateString() : '-'),
      },
      {
        key: 'rental_status',
        label: 'Status',
        align: 'center',
        render: (value) => (
          <Badge
            variant={
              value === 'COMPLETED' ? 'default' : value === 'PENDING' ? 'secondary' : 'destructive'
            }
          >
            {value}
          </Badge>
        ),
      },
      {
        key: 'payment_method',
        label: 'Payment Method',
        align: 'center',
      },
      {
        key: 'actions',
        label: 'Actions',
        align: 'center',
        render: (_, row) => (
          <Menu
            items={[
              {
                label: 'View',
                icon: <LucideEye className="h-4 w-4 text-yellow-500" />,
                onClick: () => navigate(RouteKey.User.CarRentalApplication.parse(row.id!)),
              },
              {
                label: 'Delete',
                icon: <LucideTrash2 className="h-4 w-4 text-destructive" />,
                onClick: async () => await handleDelete(row as CarRental),
              },
            ]}
          />
        ),
      },
    ],
    []
  );

  const items = useMemo(() => {
    if (!data?.data?.data) return [];
    return data.data?.data.map((item) => ({
      id: item.id,
      user_id: item.user_id,
      user: item.user,
      car_posting_id: item.car_posting_id,
      car_posting: item.car_posting,
      days: item.days,
      deposit: item.deposit,
      start_date: item.start_date,
      return_date: item.return_date,
      rental_status: item.rental_status,
      payment_method: item.payment_method,
    }));
  }, [data]);

  const totalItems = useMemo(() => {
    if (!data?.data) return 1;
    return data?.data?.total ?? data?.data?.data?.length ?? 1;
  }, [data]);

  const handleDelete = async (data: CarRental) => {
    confirm.confirm(async () => {
      try {
        // Call delete API with data.id
        await deleteCarRental({ id: data.id! });
        toast.success('Car rental deleted successfully!');
      } catch {
        // Handle error if needed
      }
    });
  };

  return (
    <PageLayout title="Car Rental Management" description="Manage car rentals for your company.">
      <Table
        isLoading={isLoading}
        columns={columns}
        data={items}
        page={page}
        pageSize={rows}
        totalItems={totalItems}
        onPageChange={setPage}
        onPageSizeChange={setRows}
        onRowClick={(row) => navigate(RouteKey.User.CarRentalApplication.parse(row.id!))}
      />
    </PageLayout>
  );
}
