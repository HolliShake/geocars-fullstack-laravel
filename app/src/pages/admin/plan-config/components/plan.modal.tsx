/* eslint-disable react-hooks/exhaustive-deps */
import Modal, { type ModalState } from '@/components/custom/modal.component';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { renderError } from '@/lib/error';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreatePlan, useUpdatePlan } from '@rest/api';
import type { Plan } from '@rest/models';
import { Loader2 } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const schema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.number().min(0, 'Price must be a positive number'),
  active: z.boolean(),
});

type Schema = z.infer<typeof schema>;

const field = () => ({
  name: '',
  description: '',
  price: 0,
  active: false,
});

export default function AdminPlanModal({
  controller,
}: {
  controller: ModalState<Plan>;
}): React.ReactElement {
  const {
    handleSubmit,
    register,
    reset,
    setError,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Schema>({
    defaultValues: field(),
    resolver: zodResolver(schema),
    mode: 'all',
  });

  const { mutateAsync: createPlan, isPending: isCreating } = useCreatePlan();
  const { mutateAsync: updatePlan, isPending: isUpdating } = useUpdatePlan();

  const isEdit = useMemo(() => {
    return !!controller.data?.id;
  }, [controller.data]);

  const isSaving = useMemo(() => isCreating || isUpdating, [isCreating, isUpdating]);

  const activeValue = watch('active');

  const onSubmit = async (data: Schema) => {
    try {
      if (isEdit) {
        // Call update API with data
        await updatePlan({
          id: controller.data?.id || 0,
          data: {
            ...controller?.data,
            ...data,
          } as Plan,
        });
      } else {
        await createPlan({
          data: data as Plan,
        });
      }
      controller.closeFn();
      toast.success('Plan submitted successfully!');
    } catch (error) {
      renderError(error, setError);
    }
  };

  useEffect(() => {
    if (!controller?.data) return reset(field());
    reset({
      ...controller.data,
    });
  }, [controller.data]);

  return (
    <Modal controller={controller} title="Plan Details" size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-2">
        <div className="space-y-1">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <Input
            {...register('name')}
            type="text"
            id="name"
            disabled={isSaving}
            aria-describedby={errors.name ? 'name-error' : undefined}
          />
          {errors.name && (
            <p id="name-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.name.message}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <Textarea
            {...register('description')}
            id="description"
            rows={3}
            disabled={isSaving}
            aria-describedby={errors.description ? 'description-error' : undefined}
          />
          {errors.description && (
            <p id="description-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.description.message}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <label htmlFor="price" className="block text-sm font-medium text-gray-700">
            Price
          </label>
          <Input
            {...register('price', { valueAsNumber: true })}
            type="number"
            id="price"
            step="0.01"
            min="0"
            disabled={isSaving}
            aria-describedby={errors.price ? 'price-error' : undefined}
          />
          {errors.price && (
            <p id="price-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.price.message}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label htmlFor="active" className="block text-sm font-medium text-gray-700">
              Active Status
            </label>
            <Switch
              id="active"
              checked={activeValue}
              onCheckedChange={(checked) => setValue('active', checked)}
              disabled={isSaving}
              aria-describedby="active-description"
            />
          </div>
          <p id="active-description" className="text-xs text-muted-foreground">
            Enable or disable this plan for new subscriptions
          </p>
        </div>

        {/* action button labels */}
        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" onClick={controller.closeFn} variant="outline" disabled={isSaving}>
            Cancel
          </Button>
          <Button type="submit" variant="default" disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
