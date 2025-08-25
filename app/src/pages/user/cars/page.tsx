/* eslint-disable react-hooks/exhaustive-deps */
import { useConfirm } from '@/components/confirm.provider';
import { useModal } from '@/components/custom/modal.component';
import ViewList from '@/components/custom/view.component';
import PageLayout from '@/components/layout/page.layout';
import CarCard from '@/components/shared/car-card.component';
import { Button } from '@/components/ui/button';
import useCompanyStore from '@/store/company.store';
import useSearchStore from '@/store/search.store';
import { useDeleteCar, useGetCarPaginated } from '@rest/api';
import type { Car } from '@rest/models/car';
import { LucideEdit, LucidePlus, LucideTrash2 } from 'lucide-react';
import React, { useMemo } from 'react';
import { toast } from 'sonner';
import { useDebounce } from 'use-debounce';
import UserQuickCarModal from './components/car.modal';

export default function UserQuickCarPage(): React.ReactElement {
  const { selectedCompany } = useCompanyStore();
  const { searchQuery } = useSearchStore();
  const [debounced] = useDebounce(searchQuery, 300);
  const [page, setPage] = React.useState(1);
  const [rows, setRows] = React.useState(12);

  const { data, isPending: isLoading } = useGetCarPaginated(
    {
      search: debounced,
      page,
      rows,
      user_company_id: selectedCompany?.id ?? 0,
    },
    {
      query: {
        enabled: !!selectedCompany,
      },
    }
  );

  const { mutateAsync: deleteCar } = useDeleteCar();

  const modal = useModal<Car>();

  const confirm = useConfirm();

  const carCards = useMemo(() => {
    if (!data?.data?.data) return [];
    return data.data.data.map((car) => (
      <CarCard
        key={car.id}
        car={car}
        imageUrl={`https://placehold.co/600x400?text=${car.brand}+${car.model}`}
        onClick={(selectedCar) => modal.openFn(selectedCar)}
        actions={[
          {
            label: <LucideEdit className="w-4 h-4" />,
            variant: 'outline',
            onClick: () => modal.openFn(car),
          },
          {
            label: <LucideTrash2 className="w-4 h-4" />,
            variant: 'destructive',
            onClick: () => handleDelete(car),
          },
        ]}
      />
    ));
  }, [data]);

  const totalItems = useMemo(() => {
    if (!data?.data) return 1;
    return data?.data?.total ?? data?.data?.data?.length ?? 1;
  }, [data]);

  const handleDelete = async (car: Car) => {
    confirm.confirm(async () => {
      try {
        await deleteCar({ id: car.id! });
        toast.success('Car deleted successfully!');
      } catch {
        // Handle error if needed
      }
    });
  };

  return (
    <PageLayout title="Car Management" description="Manage your company's vehicle fleet.">
      <div className="w-full items-end flex justify-end">
        <Button
          onClick={() => {
            modal.openFn();
          }}
        >
          <LucidePlus className="mr-1" />
          Add Car
        </Button>
      </div>

      <ViewList
        page={page}
        pageSize={rows}
        totalItems={totalItems}
        isLoading={isLoading}
        onPageChange={setPage}
        onPageSizeChange={setRows}
        tilesPerRow={3}
        gap="gap-6"
      >
        {carCards}
      </ViewList>

      <UserQuickCarModal controller={modal} />
    </PageLayout>
  );
}
