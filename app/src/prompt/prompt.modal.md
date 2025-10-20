**Generate Modal Content By Using The Fields Below**

**Criteria**

- Use basic shadcn form elements: Input|Select|Switch|Button|Textarea|Radio|Checkbox|Label
- Wrap entire form with proper form validation (React Hook Form recommended)
- Register every field with appropriate validation rules
- Implement loading states for form submission with disabled inputs and loading spinner
- Display field-level validation messages with proper error styling
- Include form-level error handling for submission failures
- Add proper accessibility attributes (aria-labels, aria-describedby)
- Use consistent spacing and layout following shadcn design patterns
- Include cancel and submit buttons with appropriate states
- Implement proper focus management for modal accessibility
- Add confirmation dialogs for destructive actions if applicable
- Uses zod and zodResolver use "useForm" Hook

**Additional Requirements**

- Ensure responsive design for mobile and desktop
- Include proper TypeScript types for form data
- Add form reset functionality when modal closes
- Implement proper escape key and overlay click handling
- Do not change action buttons label(s)
- As much as Possible avoid using <Controller /> <Form> tag, just use basig shadcn elements

**Example**

```tsx
/* eslint-disable react-hooks/exhaustive-deps */
import Modal, { type ModalState } from '@/components/custom/modal.component';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
});

type Schema = z.infer<typeof schema>;

const field = () => ({
  name: '',
  description: '',
  price: 0,
});

export default function PlanModal({
  controller,
}: {
  controller: ModalState<Plan>;
}): React.ReactElement {
  const {
    handleSubmit,
    register,
    reset,
    setError,
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
          <Input {...register('name')} type="text" id="name" />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
        </div>

        <div className="space-y-1">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <Textarea {...register('description')} id="description" rows={3} />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
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
          />
          {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>}
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
```
