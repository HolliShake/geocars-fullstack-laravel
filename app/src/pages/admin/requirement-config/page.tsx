/* eslint-disable react-hooks/exhaustive-deps */
import { useConfirm } from '@/components/confirm.provider';
import { Menu } from '@/components/custom/menu.component';
import { useModal } from '@/components/custom/modal.component';
import Table, { type TableColumn } from '@/components/custom/table.component';
import PageLayout from '@/components/layout/page.layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RoleEnum } from '@/constants/role.constant';
import useSearchStore from '@/store/search.store';
import type { Role } from '@/types/role';
import { TabsContent } from '@radix-ui/react-tabs';
import { useDeleteRequirement, useGetRequirementPaginated } from '@rest/api';
import type { Requirement } from '@rest/models/requirement';
import { LucidePen, LucidePlus, LucideTrash2 } from 'lucide-react';
import React, { useMemo } from 'react';
import { toast } from 'sonner';
import { useDebounce } from 'use-debounce';
import AdminRequirementModal from './components/requirement.modal';

export default function AdminRequirementConfigPage(): React.ReactElement {
  const { searchQuery } = useSearchStore();
  const [debounced] = useDebounce(searchQuery, 300);
  const [userPage, setUserPage] = React.useState(1);
  const [renterPage, setRenterPage] = React.useState(1);
  const [userRows, setUserRows] = React.useState(10);
  const [renterRows, setRenterRows] = React.useState(10);
  const [activeTab, setActiveTab] = React.useState(RoleEnum.user);

  // User requirements data
  const { data: userData, isPending: isUserLoading } = useGetRequirementPaginated({
    search: debounced,
    page: userPage,
    rows: userRows,
    role: 'user',
  });

  // Renter requirements data
  const { data: renterData, isPending: isRenterLoading } = useGetRequirementPaginated({
    search: debounced,
    page: renterPage,
    rows: renterRows,
    role: 'renter',
  });

  const { mutateAsync: deleteRequirement } = useDeleteRequirement();

  const modal = useModal<Requirement>();

  const confirm = useConfirm();

  const columns = useMemo<TableColumn[]>(
    () => [
      {
        key: 'id',
        label: 'ID',
        align: 'left',
      },
      {
        key: 'name',
        label: 'Name',
        align: 'left',
      },
      {
        key: 'description',
        label: 'Description',
        align: 'left',
      },
      {
        key: 'is_required',
        label: 'Required',
        align: 'center',
        render: (_, row) => (
          <Badge
            variant="outline"
            className={
              row.is_required
                ? 'bg-orange-100 text-orange-800 border-orange-300'
                : 'bg-blue-100 text-blue-800 border-blue-300'
            }
          >
            {row.is_required ? 'Required' : 'Optional'}
          </Badge>
        ),
      },
      {
        key: 'is_active',
        label: 'Status',
        align: 'center',
        render: (_, row) => (
          <Badge
            variant="outline"
            className={
              row.is_active
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : 'bg-slate-100 text-slate-700 border-slate-300'
            }
          >
            {row.is_active ? 'Active' : 'Inactive'}
          </Badge>
        ),
      },
      {
        key: 'role',
        label: 'Role',
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
                label: 'Edit',
                icon: <LucidePen className="h-4 w-4 text-blue-500" />,
                onClick: () => modal.openFn(row as Requirement),
              },
              {
                label: 'Delete',
                icon: <LucideTrash2 className="h-4 w-4 text-destructive" />,
                onClick: async () => await handleDelete(row as Requirement),
              },
            ]}
          />
        ),
      },
    ],
    []
  );

  const userItems = useMemo(() => {
    if (!userData?.data?.data) return [];
    return userData.data?.data.map((item: Requirement) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      role: item.role,
      is_required: item.is_required,
      is_active: item.is_active,
    }));
  }, [userData]);

  const renterItems = useMemo(() => {
    if (!renterData?.data?.data) return [];
    return renterData.data?.data.map((item: Requirement) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      role: item.role,
      is_required: item.is_required,
      is_active: item.is_active,
    }));
  }, [renterData]);

  const userTotalItems = useMemo(() => {
    if (!userData?.data) return 1;
    return userData?.data?.total ?? userData?.data?.data?.length ?? 1;
  }, [userData]);

  const renterTotalItems = useMemo(() => {
    if (!renterData?.data) return 1;
    return renterData?.data?.total ?? renterData?.data?.data?.length ?? 1;
  }, [renterData]);

  const handleDelete = async (data: Requirement) => {
    confirm.confirm(async () => {
      try {
        await deleteRequirement({ id: data.id! });
        toast.success('Requirement deleted successfully!');
      } catch {
        toast.error('Failed to delete requirement');
      }
    });
  };

  const handleCreateRequirement = (role: string) => {
    modal.openFn({ role } as Requirement);
  };

  return (
    <PageLayout
      title="Requirement Configuration"
      description="Manage your requirements and their configurations."
    >
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as unknown as Role)}>
        <TabsList>
          <TabsTrigger value={RoleEnum.user}>{RoleEnum.user}</TabsTrigger>
          <TabsTrigger value={RoleEnum.renter}>{RoleEnum.renter}</TabsTrigger>
        </TabsList>

        <TabsContent value={RoleEnum.user}>
          <div className="w-full items-end flex justify-end mb-4">
            <Button onClick={() => handleCreateRequirement(RoleEnum.user)}>
              <LucidePlus className="mr-1" />
              Create
            </Button>
          </div>
          <Table
            isLoading={isUserLoading}
            columns={columns}
            data={userItems}
            page={userPage}
            pageSize={userRows}
            totalItems={userTotalItems}
            onPageChange={setUserPage}
            onPageSizeChange={setUserRows}
            onRowClick={(row) => modal.openFn(row as Requirement)}
          />
        </TabsContent>

        <TabsContent value={RoleEnum.renter}>
          <div className="w-full items-end flex justify-end mb-4">
            <Button onClick={() => handleCreateRequirement(RoleEnum.renter)}>
              <LucidePlus className="mr-1" />
              Create
            </Button>
          </div>
          <Table
            isLoading={isRenterLoading}
            columns={columns}
            data={renterItems}
            page={renterPage}
            pageSize={renterRows}
            totalItems={renterTotalItems}
            onPageChange={setRenterPage}
            onPageSizeChange={setRenterRows}
            onRowClick={(row) => modal.openFn(row as Requirement)}
          />
        </TabsContent>
      </Tabs>

      <AdminRequirementModal controller={modal} />
    </PageLayout>
  );
}
