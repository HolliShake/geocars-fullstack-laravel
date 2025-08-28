/* eslint-disable react-hooks/exhaustive-deps */
import { useConfirm } from '@/components/confirm.provider';
import { Menu } from '@/components/custom/menu.component';
import { useModal } from '@/components/custom/modal.component';
import Table, { type TableColumn } from '@/components/custom/table.component';
import PageLayout from '@/components/layout/page.layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RouteKey } from '@/navigation/route';
import useSearchStore from '@/store/search.store';
import { useDeleteUserCompany, useGetUserCompanyPaginated } from '@rest/api';
import type { UserCompany } from '@rest/models/userCompany';
import { LucideCar, LucidePen, LucidePlus, LucideTrash2 } from 'lucide-react';
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { useDebounce } from 'use-debounce';
import UserCompanyModal from './components/company.modal';

export default function UserCompanyConfigPage(): React.ReactElement {
  const navigate = useNavigate();
  const { searchQuery } = useSearchStore();
  const [debounced] = useDebounce(searchQuery, 300);
  const [page, setPage] = React.useState(1);
  const [rows, setRows] = React.useState(10);
  const { data, isPending: isLoading } = useGetUserCompanyPaginated({
    search: debounced,
    page,
    rows,
    current_user: true,
  });

  const { mutateAsync: deleteUserCompany } = useDeleteUserCompany();

  const modal = useModal<UserCompany>();

  const confirm = useConfirm();

  const columns = useMemo<TableColumn[]>(
    () => [
      {
        key: 'id',
        label: 'ID',
        align: 'left',
      },
      {
        key: 'owner.name',
        label: 'Owner',
        align: 'left',
      },
      {
        key: 'name',
        label: 'Company Name',
        align: 'left',
      },
      {
        key: 'address',
        label: 'Address',
        align: 'left',
      },
      {
        key: 'city',
        label: 'City',
        align: 'left',
      },
      {
        key: 'country',
        label: 'Country',
        align: 'left',
      },
      {
        key: 'schedule',
        label: 'Schedule',
        render: (_, row) => {
          if (!row) return;
          return row.days_open.split(',').map((day: string) => (
            <Badge key={day} variant="outline">
              {day.substring(0, 3)}
            </Badge>
          ));
        },
      },
      {
        key: 'opening_time',
        label: 'Opening Time',
        align: 'center',
      },
      {
        key: 'closing_time',
        label: 'Closing Time',
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
                label: 'Cars',
                icon: <LucideCar className="h-4 w-4 text-yellow-500" />,
                onClick: () => navigate(RouteKey.User.CompanyCar.parse(row.id!)),
              },
              {
                label: 'Edit',
                icon: <LucidePen className="h-4 w-4 text-blue-500" />,
                onClick: () => modal.openFn(row as UserCompany),
              },
              {
                label: 'Delete',
                icon: <LucideTrash2 className="h-4 w-4 text-destructive" />,
                onClick: async () => await handleDelete(row as UserCompany),
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
      name: item.name,
      address: item.address,
      city: item.city,
      country: item.country,
      postal_code: item.postal_code,
      opening_time: item.opening_time,
      closing_time: item.closing_time,
      days_open: item.days_open,
      user_id: item.user_id,
      owner: item.owner,
    }));
  }, [data]);

  const totalItems = useMemo(() => {
    if (!data?.data) return 1;
    return data?.data?.total ?? data?.data?.data?.length ?? 1;
  }, [data]);

  const handleDelete = async (data: UserCompany) => {
    confirm.confirm(async () => {
      try {
        await deleteUserCompany({ id: data.id! });
        toast.success('User company deleted successfully!');
      } catch {
        // Handle error if needed
      }
    });
  };

  return (
    <PageLayout
      title=" Company Configuration"
      description="Manage companies and their business information."
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

      <Table
        isLoading={isLoading}
        columns={columns}
        data={items}
        page={page}
        pageSize={rows}
        totalItems={totalItems}
        onPageChange={setPage}
        onPageSizeChange={setRows}
        onRowClick={(row) => modal.openFn(row as UserCompany)}
      />

      <UserCompanyModal controller={modal} />
    </PageLayout>
  );
}
