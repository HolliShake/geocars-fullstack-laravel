/* eslint-disable react-hooks/exhaustive-deps */
import { useConfirm } from '@/components/confirm.provider';
import { Menu } from '@/components/custom/menu.component';
import { useModal } from '@/components/custom/modal.component';
import Table, { type TableColumn } from '@/components/custom/table.component';
import PageLayout from '@/components/layout/page.layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import useSearchStore from '@/store/search.store';
import {
  useDeleteUserAccount,
  useGetUserAccountPaginated,
  type UserAccount,
} from '@rest/user-account.custom';
import { LucidePen, LucidePlus, LucideTrash2 } from 'lucide-react';
import React, { useMemo } from 'react';
import { toast } from 'sonner';
import { useDebounce } from 'use-debounce';
import UserAccountModal from './components/account.modal';

export default function UserAccountPage(): React.ReactElement {
  const { searchQuery } = useSearchStore();
  const [debounced] = useDebounce(searchQuery, 300);
  const [page, setPage] = React.useState(1);
  const [rows, setRows] = React.useState(10);

  const {
    data,
    isPending: isLoading,
    refetch,
  } = useGetUserAccountPaginated({
    search: debounced,
    page,
    rows,
    current_user: true,
  });

  const { mutateAsync: deleteUserAccount } = useDeleteUserAccount();

  const modal = useModal<UserAccount>();
  const confirm = useConfirm();

  const columns = useMemo<TableColumn[]>(
    () => [
      {
        key: 'id',
        label: 'ID',
        align: 'left',
      },
      {
        key: 'type',
        label: 'Type',
        render: (value) => <Badge variant="outline">{value}</Badge>,
      },
      {
        key: 'account_number',
        label: 'Account Number',
        align: 'left',
      },
      {
        key: 'is_default',
        label: 'Default',
        align: 'center',
        render: (value) =>
          value ? (
            <Badge className="bg-green-600 hover:bg-green-600 text-white">Default</Badge>
          ) : (
            <Badge variant="secondary">No</Badge>
          ),
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
                onClick: () => modal.openFn(row as UserAccount),
              },
              {
                label: 'Delete',
                icon: <LucideTrash2 className="h-4 w-4 text-destructive" />,
                onClick: async () => await handleDelete(row as UserAccount),
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
    return data.data.data.map((item) => ({
      id: item.id,
      user_id: item.user_id,
      type: item.type,
      account_number: item.account_number,
      is_default: item.is_default,
      owner: item.owner,
    }));
  }, [data]);

  const totalItems = useMemo(() => {
    if (!data?.data) return 1;
    return data.data.total ?? data.data.data?.length ?? 1;
  }, [data]);

  const handleDelete = async (account: UserAccount) => {
    confirm.confirm(async () => {
      try {
        await deleteUserAccount({ id: account.id! });
        toast.success('Account deleted successfully!');
        refetch();
      } catch {
        toast.error('Failed to delete account.');
      }
    });
  };

  return (
    <PageLayout
      title="Account Management"
      description="Manage your bank and e-wallet payout accounts."
    >
      <div className="w-full items-end flex justify-end">
        <Button
          onClick={() => {
            modal.openFn(undefined);
          }}
        >
          <LucidePlus className="mr-1" />
          Add Account
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
        onRowClick={(row) => modal.openFn(row as UserAccount)}
      />

      <UserAccountModal controller={modal} successFn={refetch} />
    </PageLayout>
  );
}
