/* eslint-disable react-hooks/exhaustive-deps */
import { useModal } from '@/components/custom/modal.component';
import ViewList from '@/components/custom/view.component';
import PageLayout from '@/components/layout/page.layout';
import { CarPostingCard } from '@/components/shared/car-posting.component';
import { Button } from '@/components/ui/button';
import useCompanyStore from '@/store/company.store';
import useSearchStore from '@/store/search.store';
import { useGetCarPostingPaginated } from '@rest/api';
import type { CarPosting } from '@rest/models/carPosting';
import { LucidePlus } from 'lucide-react';
import React, { useMemo } from 'react';
import { useDebounce } from 'use-debounce';
import CarPostingModal from './components/car-posting.modal';

export default function UserCarPostingPage(): React.ReactElement {
  const { selectedCompany } = useCompanyStore();
  const { searchQuery } = useSearchStore();
  const [debounced] = useDebounce(searchQuery, 300);
  const [page, setPage] = React.useState(1);
  const [rows, setRows] = React.useState(12);

  const { data, isPending: isLoading } = useGetCarPostingPaginated(
    {
      search: debounced,
      page,
      rows,
      company_id: selectedCompany?.id,
    },
    {
      query: {
        enabled: !!selectedCompany,
      },
    }
  );

  //   const { mutateAsync: deleteCarPosting } = useDeleteCarPosting();

  const modal = useModal<CarPosting>();

  //   const confirm = useConfirm();

  const carPostingCards = useMemo(() => {
    if (!data?.data?.data) return [];
    return data.data.data.map((carPosting) => (
      <CarPostingCard
        key={carPosting.id}
        carPosting={carPosting}
        imageUrl={carPosting.car?.image_url ?? ''}
        onClick={() => modal.openFn(carPosting)}
      />
    ));
  }, [data]);

  const totalItems = useMemo(() => {
    if (!data?.data) return 1;
    return data?.data?.total ?? data?.data?.data?.length ?? 1;
  }, [data]);

  //   const handleDelete = async (carPosting: CarPosting) => {
  //     confirm.confirm(async () => {
  //       try {
  //         await deleteCarPosting({ id: carPosting.id! });
  //         toast.success('Car posting deleted successfully!');
  //       } catch {
  //         toast.error('Failed to delete car posting');
  //       }
  //     });
  //   };

  return (
    <PageLayout
      title="Car Postings"
      description="Manage your car rental postings and availability."
    >
      <div className="w-full items-end flex justify-end">
        <Button
          onClick={() => {
            modal.openFn();
          }}
        >
          <LucidePlus className="mr-1" />
          Create Posting
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
        {carPostingCards}
      </ViewList>

      {/* Note: CarPostingModal component would need to be created */}
      <CarPostingModal controller={modal} />
    </PageLayout>
  );
}
