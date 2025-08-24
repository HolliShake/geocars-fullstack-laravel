**Generate Page Content By Using The Sample Code Below**

This comprehensive React component demonstrates a full-featured admin page with CRUD operations. Use this template to create similar data management pages in your application.

```tsx
/* eslint-disable react-hooks/exhaustive-deps */
import { useConfirm } from '@/components/confirm-provider';
import { Menu } from '@/components/custom/menu.component';
import { useModal } from '@/components/custom/modal.component';
import Table, { type TableColumn } from '@/components/custom/table.component';
import PageLayout from '@/components/layout/page.layout';
import { Button } from '@/components/ui/button';
import useSearchStore from '@/store/search.store';
import { useDeletePlan, useGetPlansPaginated } from '@rest/api';
import type { Plan } from '@rest/models/plan';
import { LucidePen, LucidePlus, LucideTrash2 } from 'lucide-react';
import React, { useMemo } from 'react';
import { toast } from 'sonner';
import { useDebounce } from 'use-debounce';
import PlanModal from './components/plan.modal';

export default function PlanConfigPage(): React.ReactElement {
  const { searchQuery } = useSearchStore();
  const [debounced] = useDebounce(searchQuery, 300);
  const [page, setPage] = React.useState(1);
  const [rows, setRows] = React.useState(10);
  const { data, isPending: isLoading } = useGetPlansPaginated({
    search: debounced,
    page,
    rows,
  });

  const { mutateAsync: deletePlan } = useDeletePlan();

  const modal = useModal<Plan>();

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
        key: 'price',
        label: 'Price',
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
                onClick: () => modal.openFn(row as Plan),
              },
              {
                label: 'Delete',
                icon: <LucideTrash2 className="h-4 w-4 text-destructive" />,
                onClick: async () => await handleDelete(row as Plan),
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
      description: item.description,
      price: item.price,
    }));
  }, [data]);

  const totalItems = useMemo(() => {
    if (!data?.data) return 1;
    return data?.data?.total ?? data?.data?.data?.length ?? 1;
  }, [data]);

  const handleDelete = async (data: Plan) => {
    confirm.confirm(async () => {
      try {
        // Call delete API with data.id
        await deletePlan({ id: data.id });
        toast.success('Plan deleted successfully!');
      } catch {
        // Handle error if needed
      }
    });
  };

  return (
    <PageLayout
      title="Plan Configuration"
      description="Manage your plans and pricing configurations."
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
        onRowClick={(row) => modal.openFn(row as Plan)}
      />

      <PlanModal controller={modal} />
    </PageLayout>
  );
}
```
