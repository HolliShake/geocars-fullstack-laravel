/* eslint-disable react-hooks/exhaustive-deps */
import { useConfirm } from '@/components/confirm-provider';
import { Menu } from '@/components/custom/menu.component';
import { useModal } from '@/components/custom/modal.component';
import Table, { type TableColumn } from '@/components/custom/table.component';
import PageLayout from '@/components/layout/page.layout';
import { Button } from '@/components/ui/button';
import { dumbCurrency } from '@/lib/dumb-currency';
import AdminPlanModal from '@/pages/admin/plan-config/components/plan.modal';
import useSearchStore from '@/store/search.store';
import { useDeletePlanFeature, useGetPlanById, useGetPlanFeaturePaginated } from '@rest/api';
import type { Plan, PlanFeature } from '@rest/models';
import {
  LucideCheck,
  LucidePen,
  LucidePlus,
  LucideRocket,
  LucideTrash2,
  LucideX,
} from 'lucide-react';
import React, { useMemo } from 'react';
import { useParams } from 'react-router';
import { toast } from 'sonner';
import { useDebounce } from 'use-debounce';
import AdminPlanFeatureModal from './components/plan-feature.modal';

export default function AdminPlanFeaturesPage(): React.ReactElement {
  const { id } = useParams<{ id: string }>();
  const planId = Number(id);

  const { data: plan, isPending: isPlanLoading } = useGetPlanById(planId);

  const { searchQuery } = useSearchStore();
  const [debounced] = useDebounce(searchQuery, 300);
  const [page, setPage] = React.useState(1);
  const [rows, setRows] = React.useState(10);
  const { data, isPending: isLoading } = useGetPlanFeaturePaginated({
    search: debounced,
    page,
    rows,
    plan_id: planId,
  });

  const { mutateAsync: deletePlanFeature } = useDeletePlanFeature();

  const modal = useModal<PlanFeature>();
  const planModal = useModal<Plan>();

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
        key: 'value',
        label: 'Value',
        align: 'left',
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
                onClick: () => modal.openFn(row as PlanFeature),
              },
              {
                label: 'Delete',
                icon: <LucideTrash2 className="h-4 w-4 text-destructive" />,
                onClick: async () => await handleDelete(row as PlanFeature),
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
      value: item.value,
    }));
  }, [data]);

  const totalItems = useMemo(() => {
    if (!data?.data) return 1;
    return data?.data?.total ?? data?.data?.data?.length ?? 1;
  }, [data]);

  const handleDelete = async (data: PlanFeature) => {
    confirm.confirm(async () => {
      try {
        // Call delete API with data.id
        await deletePlanFeature({ id: data.id });
        toast.success('Plan feature deleted successfully!');
      } catch {
        // Handle error if needed
      }
    });
  };

  return (
    <PageLayout
      title="Plan Features Configuration"
      description="Manage features for this specific plan."
    >
      <div className="w-full items-end flex justify-end">
        <Button
          onClick={() => {
            modal.openFn({ plan_id: planId } as PlanFeature); // Pre-populate with plan ID
          }}
        >
          <LucidePlus className="mr-1" />
          Create
        </Button>
      </div>

      {isPlanLoading ? (
        <div className="w-full mb-8">
          <div className="animate-pulse space-y-6">
            {/* Header skeleton */}
            <div className="relative overflow-hidden rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 p-6">
              <div className="flex items-center gap-6">
                <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 animate-pulse" />
                <div className="flex-1 space-y-3">
                  <div className="h-6 w-48 rounded-lg bg-gradient-to-r from-primary/20 via-primary/10 to-transparent animate-pulse" />
                  <div className="h-4 w-64 rounded bg-gradient-to-r from-muted/40 via-muted/20 to-transparent animate-pulse" />
                </div>
                <div className="h-20 w-32 rounded-xl bg-gradient-to-r from-primary/15 via-primary/8 to-primary/5 animate-pulse" />
              </div>
            </div>

            {/* Stats skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-24 rounded-xl bg-gradient-to-br from-card/60 via-card/40 to-card/20 border border-border/30 animate-pulse"
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full mb-8 space-y-6">
          {/* Enhanced Plan Header Card */}
          <div className="relative group overflow-hidden rounded-2xl bg-gradient-to-br from-card via-card/95 to-card/90 backdrop-blur-xl border border-border/50 shadow-2xl shadow-primary/5">
            {/* Animated background pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent"></div>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-secondary/5 via-transparent to-transparent"></div>

            {/* Subtle border gradients */}
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent"></div>
            <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>

            <div className="relative p-8 flex items-center gap-8">
              {/* Enhanced icon with floating effect */}
              <div className="relative">
                <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 backdrop-blur-sm border border-primary/20 shadow-lg flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:shadow-2xl group-hover:shadow-primary/20">
                  <LucideRocket className="h-10 w-10 text-primary transition-all duration-500 group-hover:text-primary/90 group-hover:rotate-12" />
                </div>
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-primary/10 to-secondary/10 blur-lg opacity-75 group-hover:opacity-100 transition-all duration-500"></div>
              </div>

              {/* Enhanced content with better typography */}
              <div className="flex-1 min-w-0 space-y-3">
                <div className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                  {plan?.data?.name}
                </div>
                <div className="text-base text-muted-foreground leading-relaxed max-w-3xl">
                  {plan?.data?.description}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground/80">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary/60"></div>
                  <span>Plan Configuration</span>
                </div>
              </div>

              {/* Enhanced price display with better visual hierarchy */}
              <div className="relative">
                <div className="group/price relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent backdrop-blur-sm border border-primary/20 shadow-lg transition-all duration-500 hover:shadow-2xl hover:shadow-primary/20 hover:scale-105">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover/price:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative p-6 text-center">
                    <div className="text-sm font-medium text-primary/80 mb-1">Monthly Price</div>
                    <div className="text-4xl font-bold text-primary mb-1">
                      {dumbCurrency(plan?.data?.price ?? 0)}
                    </div>
                    <div className="text-xs text-muted-foreground">per month</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Features Count */}
            <div className="relative group overflow-hidden rounded-xl bg-gradient-to-br from-card via-card/95 to-card/90 border border-border/50 p-6 transition-all duration-300 hover:shadow-lg hover:border-border">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <LucideRocket className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">{items.length}</div>
                  <div className="text-sm text-muted-foreground">Total Features</div>
                </div>
              </div>
            </div>

            {/* Plan Status */}
            <div className="relative group overflow-hidden rounded-xl bg-gradient-to-br from-card via-card/95 to-card/90 border border-border/50 p-6 transition-all duration-300 hover:shadow-lg hover:border-border">
              <div
                className={`absolute inset-0 bg-gradient-to-br ${plan?.data?.active ? 'from-green-500/5' : 'from-red-500/5'} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
              ></div>
              <div className="relative flex items-center gap-4">
                <div
                  className={`h-12 w-12 rounded-lg ${plan?.data?.active ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'} border flex items-center justify-center`}
                >
                  {plan?.data?.active ? (
                    <LucideCheck className="h-6 w-6 text-green-500" />
                  ) : (
                    <LucideX className="h-6 w-6 text-red-500" />
                  )}
                </div>
                <div>
                  <div className="text-lg font-semibold text-foreground">
                    {plan?.data?.active ? 'Active' : 'Inactive'}
                  </div>
                  <div className="text-sm text-muted-foreground">Plan Status</div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div
              className="relative group overflow-hidden rounded-xl bg-gradient-to-br from-card via-card/95 to-card/90 border border-border/50 p-6 transition-all duration-300 hover:shadow-lg hover:border-border cursor-default"
              role="button"
              onClick={() => planModal.openFn(plan?.data as Plan)}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                  <LucidePlus className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <div className="text-lg font-semibold text-foreground">Manage</div>
                  <div className="text-sm text-muted-foreground">Quick Access</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Table
        isLoading={isLoading}
        columns={columns}
        data={items}
        page={page}
        pageSize={rows}
        totalItems={totalItems}
        onPageChange={setPage}
        onPageSizeChange={setRows}
        onRowClick={(row) => modal.openFn(row as PlanFeature)}
      />

      <AdminPlanFeatureModal controller={modal} />
      <AdminPlanModal controller={planModal} />
    </PageLayout>
  );
}
