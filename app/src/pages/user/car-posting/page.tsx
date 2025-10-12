/* eslint-disable react-hooks/exhaustive-deps */
import { useModal } from '@/components/custom/modal.component';
import ViewList from '@/components/custom/view.component';
import PageLayout from '@/components/layout/page.layout';
import CarPostingCommentModal from '@/components/shared/car-posting-comments.component';
import { CarPostingCard } from '@/components/shared/car-posting.component';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

  // Separate pagination state for each tab
  const [allPage, setAllPage] = React.useState(1);
  const [allRows, setAllRows] = React.useState(12);
  const [activePage, setActivePage] = React.useState(1);
  const [activeRows, setActiveRows] = React.useState(12);
  const [expiredPage, setExpiredPage] = React.useState(1);
  const [expiredRows, setExpiredRows] = React.useState(12);

  const { data: allData, isPending: isAllLoading } = useGetCarPostingPaginated(
    {
      search: debounced,
      page: allPage,
      rows: allRows,
      company_id: selectedCompany?.id,
      status: 'all',
    },
    {
      query: {
        enabled: !!selectedCompany,
      },
    }
  );

  const { data: activeData, isPending: isActiveLoading } = useGetCarPostingPaginated(
    {
      search: debounced,
      page: activePage,
      rows: activeRows,
      company_id: selectedCompany?.id,
      status: 'active',
    },
    {
      query: {
        enabled: !!selectedCompany,
      },
    }
  );

  const { data: expiredData, isPending: isExpiredLoading } = useGetCarPostingPaginated(
    {
      search: debounced,
      page: expiredPage,
      rows: expiredRows,
      company_id: selectedCompany?.id,
      status: 'expired',
    },
    {
      query: {
        enabled: !!selectedCompany,
      },
    }
  );

  //   const { mutateAsync: deleteCarPosting } = useDeleteCarPosting();

  const modal = useModal<CarPosting>();
  const commentModal = useModal<CarPosting>();

  const tabs = useMemo<{ label: string; value: string }[]>(() => {
    return [
      {
        label: 'All',
        value: 'all',
      },
      {
        label: 'Available',
        value: 'available',
      },
      {
        label: 'Expired',
        value: 'expired',
      },
    ];
  }, []);

  //   const confirm = useConfirm();

  const carPostingCards = useMemo(() => {
    if (!allData?.data?.data) return [];
    return allData.data.data.map((carPosting) => (
      <CarPostingCard
        key={carPosting.id}
        carPosting={carPosting}
        imageUrl={carPosting.car?.image_url ?? ''}
        onClick={() => modal.openFn(carPosting)}
        onViewComments={() => commentModal.openFn(carPosting)}
      />
    ));
  }, [allData]);

  const activeCarPostingCards = useMemo(() => {
    if (!activeData?.data?.data) return [];
    return activeData.data.data.map((carPosting) => (
      <CarPostingCard
        key={carPosting.id}
        carPosting={carPosting}
        imageUrl={carPosting.car?.image_url ?? ''}
        onClick={() => modal.openFn(carPosting)}
        onViewComments={() => commentModal.openFn(carPosting)}
      />
    ));
  }, [activeData]);

  const expiredCarPostingCards = useMemo(() => {
    if (!expiredData?.data?.data) return [];
    return expiredData.data.data.map((carPosting) => (
      <CarPostingCard
        key={carPosting.id}
        carPosting={carPosting}
        imageUrl={carPosting.car?.image_url ?? ''}
        onClick={() => modal.openFn(carPosting)}
        onViewComments={() => commentModal.openFn(carPosting)}
      />
    ));
  }, [expiredData]);

  const allTotalItems = useMemo(() => {
    if (!allData?.data) return 1;
    return allData?.data?.total ?? allData?.data?.data?.length ?? 1;
  }, [allData]);

  const activeTotalItems = useMemo(() => {
    if (!activeData?.data) return 1;
    return activeData?.data?.total ?? activeData?.data?.data?.length ?? 1;
  }, [activeData]);

  const expiredTotalItems = useMemo(() => {
    if (!expiredData?.data) return 1;
    return expiredData?.data?.total ?? expiredData?.data?.data?.length ?? 1;
  }, [expiredData]);

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
          Create
        </Button>
      </div>

      <Tabs
        defaultValue={'available'}
        onValueChange={(value) => {
          if (value === 'all') {
            setAllPage(1);
            setAllRows(12);
          } else if (value === 'available') {
            setActivePage(1);
            setActiveRows(12);
          } else if (value === 'expired') {
            setExpiredPage(1);
            setExpiredRows(12);
          }
        }}
      >
        <TabsList className="grid grid-cols-3 h-auto p-1 bg-card rounded-lg shadow-sm">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="relative h-9 px-4 text-sm font-medium transition-all duration-200 ease-out data-[state=active]:!bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm data-[state=inactive]:text-muted-foreground hover:text-foreground"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {/* Content */}
        <TabsContent value="all">
          <ViewList
            page={allPage}
            pageSize={allRows}
            totalItems={allTotalItems}
            isLoading={isAllLoading}
            onPageChange={setAllPage}
            onPageSizeChange={setAllRows}
            tilesPerRow={3}
            gap="gap-6"
          >
            {carPostingCards}
          </ViewList>
        </TabsContent>
        <TabsContent value="available">
          <ViewList
            page={activePage}
            pageSize={activeRows}
            totalItems={activeTotalItems}
            isLoading={isActiveLoading}
            onPageChange={setActivePage}
            onPageSizeChange={setActiveRows}
            tilesPerRow={3}
            gap="gap-6"
          >
            {activeCarPostingCards}
          </ViewList>
        </TabsContent>
        <TabsContent value="expired">
          <ViewList
            page={expiredPage}
            pageSize={expiredRows}
            totalItems={expiredTotalItems}
            isLoading={isExpiredLoading}
            onPageChange={setExpiredPage}
            onPageSizeChange={setExpiredRows}
            tilesPerRow={3}
            gap="gap-6"
          >
            {expiredCarPostingCards}
          </ViewList>
        </TabsContent>
      </Tabs>

      {/* Note: CarPostingModal component would need to be created */}
      <CarPostingModal controller={modal} />
      <CarPostingCommentModal controller={commentModal} />
    </PageLayout>
  );
}
