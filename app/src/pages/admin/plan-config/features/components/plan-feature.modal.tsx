/* eslint-disable react-hooks/exhaustive-deps */
import Modal, { type ModalState } from '@/components/custom/modal.component';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { renderError } from '@/lib/error';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreatePlanFeature, useUpdatePlanFeature } from '@rest/api';
import type { PlanFeature } from '@rest/models';
import { Loader2 } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router';
import { toast } from 'sonner';
import { z } from 'zod';

const schema = z.object({
  id: z.number().optional(),
  plan_id: z.number().min(1, 'Plan ID is required'),
  name: z.string().min(1, 'Name is required'),
  value: z.string().min(1, 'Value is required'),
});

type Schema = z.infer<typeof schema>;

const field = () => ({
  name: '',
  value: '',
  plan_id: 0,
});

export default function PlanFeatureModal({
  controller,
}: {
  controller: ModalState<PlanFeature>;
}): React.ReactElement {
  const { id } = useParams<{ id: string }>();
  const {
    handleSubmit,
    register,
    reset,
    setError,
    formState: { errors },
  } = useForm<Schema>({
    defaultValues: {
      ...field(),
      plan_id: id ? parseInt(id) : 0,
    },
    resolver: zodResolver(schema),
    mode: 'all',
  });

  const { mutateAsync: createPlanFeature, isPending: isCreating } = useCreatePlanFeature();
  const { mutateAsync: updatePlanFeature, isPending: isUpdating } = useUpdatePlanFeature();

  const isEdit = useMemo(() => {
    return !!controller.data?.id;
  }, [controller.data]);

  const isSaving = useMemo(() => isCreating || isUpdating, [isCreating, isUpdating]);

  const onSubmit = async (data: Schema) => {
    try {
      if (isEdit) {
        // Call update API with data
        await updatePlanFeature({
          id: controller.data?.id || 0,
          data: {
            ...controller?.data,
            ...data,
          } as PlanFeature,
        });
      } else {
        await createPlanFeature({
          data: data as PlanFeature,
        });
      }
      controller.closeFn();
      toast.success('Plan feature submitted successfully!');
    } catch (error) {
      renderError(error, setError);
    }
  };

  useEffect(() => {
    if (!controller?.data)
      return reset({
        ...field(),
        plan_id: id ? parseInt(id) : 0,
      });
    reset({
      ...controller.data,
      plan_id: id ? parseInt(id) : 0,
    });
  }, [controller.data, id]);

  return (
    <Modal controller={controller} title="Plan Feature Details" size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-2">
        <div className="space-y-1">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <Input {...register('name')} type="text" id="name" />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
        </div>

        <div className="space-y-1">
          <label htmlFor="value" className="block text-sm font-medium text-gray-700">
            Value
          </label>
          <Input {...register('value')} type="text" id="value" />
          {errors.value && <p className="mt-1 text-sm text-red-600">{errors.value.message}</p>}
        </div>

        {/* action button labels */}
        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" onClick={controller.closeFn} variant="outline" color="secondary">
            Cancel
          </Button>
          <Button type="submit" variant="default">
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
