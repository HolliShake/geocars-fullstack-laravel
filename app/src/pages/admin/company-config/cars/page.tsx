/* eslint-disable react-hooks/exhaustive-deps */
import { useConfirm } from '@/components/confirm.provider';
import { Menu } from '@/components/custom/menu.component';
import { useModal } from '@/components/custom/modal.component';
import Table, { type TableColumn } from '@/components/custom/table.component';
import PageLayout from '@/components/layout/page.layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import useSearchStore from '@/store/search.store';
import { useDeleteCar, useGetCarPaginated } from '@rest/api';
import type { Car } from '@rest/models/car';
import { LucidePen, LucidePlus, LucideTrash2 } from 'lucide-react';
import React, { useMemo } from 'react';
import { useParams } from 'react-router';
import { toast } from 'sonner';
import { useDebounce } from 'use-debounce';
import AdminCompanyCarModal from './components/car.modal';

export default function AdminCompanyCarPage(): React.ReactElement {
  const { company_id } = useParams<{ company_id: string }>();
  const { searchQuery } = useSearchStore();
  const [debounced] = useDebounce(searchQuery, 300);
  const [page, setPage] = React.useState(1);
  const [rows, setRows] = React.useState(10);
  const { data, isPending: isLoading } = useGetCarPaginated({
    search: debounced,
    page,
    rows,
    user_company_id: parseInt(company_id || '0'),
  });

  const { mutateAsync: deleteCar } = useDeleteCar();

  const modal = useModal<Car>();

  const confirm = useConfirm();

  const columns = useMemo<TableColumn[]>(
    () => [
      {
        key: 'id',
        label: 'ID',
        align: 'left',
      },
      {
        key: 'brand',
        label: 'Brand',
        align: 'left',
      },
      {
        key: 'model',
        label: 'Model',
        align: 'left',
      },
      {
        key: 'plate_number',
        label: 'Plate Number',
        align: 'left',
      },
      {
        key: 'color',
        label: 'Color',
        align: 'center',
      },
      {
        key: 'type',
        label: 'Type',
        align: 'center',
        render: (_, row) => <Badge variant="outline">{row?.type}</Badge>,
      },
      {
        key: 'year',
        label: 'Year',
        align: 'center',
      },
      {
        key: 'fuel_type',
        label: 'Fuel Type',
        align: 'center',
        render: (_, row) => <Badge variant="secondary">{row?.fuel_type}</Badge>,
      },
      {
        key: 'transmission',
        label: 'Transmission',
        align: 'center',
        render: (_, row) => <Badge variant="outline">{row?.transmission}</Badge>,
      },
      {
        key: 'actions',
        label: 'Actions',
        align: 'center',
        render: (_, row) => (
          <Menu
            items={[
              {
                label: 'Edit',
                icon: <LucidePen className="h-4 w-4 text-blue-500" />,
                onClick: () => modal.openFn(row as Car),
              },
              {
                label: 'Delete',
                icon: <LucideTrash2 className="h-4 w-4 text-destructive" />,
                onClick: async () => await handleDelete(row as Car),
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
      user_company_id: item.user_company_id,
      brand: item.brand,
      model: item.model,
      plate_number: item.plate_number,
      color: item.color,
      type: item.type,
      year: item.year,
      fuel_type: item.fuel_type,
      transmission: item.transmission,
      engine_capacity: item.engine_capacity,
      engine_power: item.engine_power,
      engine_torque: item.engine_torque,
      engine_type: item.engine_type,
    }));
  }, [data]);

  const totalItems = useMemo(() => {
    if (!data?.data) return 1;
    return data?.data?.total ?? data?.data?.data?.length ?? 1;
  }, [data]);

  const handleDelete = async (data: Car) => {
    confirm.confirm(async () => {
      try {
        // Call delete API with data.id
        await deleteCar({ id: data.id! });
        toast.success('Car deleted successfully!');
      } catch {
        // Handle error if needed
      }
    });
  };

  return (
    <PageLayout
      title="Car Configuration"
      description="Manage company's car fleet and vehicle configurations."
    >
      <div className="w-full items-end flex justify-end">
        <Button
          onClick={() => {
            modal.openFn(); // Open the modal without any data
          }}
        >
          <LucidePlus className="mr-1" />
          Create
        </Button>
      </div>

      <Table
        isLoading={isLoading}
        columns={columns}
        data={items}
        page={page}
        pageSize={rows}
        totalItems={totalItems}
        onPageChange={setPage}
        onPageSizeChange={setRows}
        onRowClick={(row) => modal.openFn(row as Car)}
      />

      <AdminCompanyCarModal controller={modal} />
    </PageLayout>
  );
}
