/* eslint-disable react-hooks/exhaustive-deps */
import Modal, { type ModalState } from '@/components/custom/modal.component';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { renderError } from '@/lib/error';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateRequirement, useUpdateRequirement } from '@rest/api';
import type { Requirement } from '@rest/models/requirement';
import { Loader2 } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const schema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  is_required: z.boolean(),
  is_active: z.boolean(),
  role: z.string().min(1, 'Role is required'),
});

type Schema = z.infer<typeof schema>;

const field = () => ({
  name: '',
  description: '',
  is_required: false,
  is_active: true,
  role: 'user',
});

export default function AdminRequirementModal({
  controller,
}: {
  controller: ModalState<Requirement>;
}): React.ReactElement {
  const {
    handleSubmit,
    register,
    reset,
    setError,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<Schema>({
    defaultValues: field(),
    resolver: zodResolver(schema),
    mode: 'all',
  });

  const { mutateAsync: createRequirement, isPending: isCreating } = useCreateRequirement();
  const { mutateAsync: updateRequirement, isPending: isUpdating } = useUpdateRequirement();

  const isEdit = useMemo(() => {
    return !!controller.data?.id;
  }, [controller.data]);

  const isSaving = useMemo(() => isCreating || isUpdating, [isCreating, isUpdating]);

  const watchedRole = watch('role');
  const watchedIsRequired = watch('is_required');
  const watchedIsActive = watch('is_active');

  const onSubmit = async (data: Schema) => {
    try {
      if (isEdit) {
        await updateRequirement({
          id: controller.data?.id || 0,
          data: {
            ...controller?.data,
            ...data,
          } as Requirement,
        });
      } else {
        await createRequirement({
          data: data as Requirement,
        });
      }
      controller.closeFn();
      toast.success('Requirement submitted successfully!');
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

  const handleRoleChange = async (value: string) => {
    setValue('role', value, { shouldDirty: true, shouldTouch: true });
    await trigger('role');
  };

  const handleIsRequiredChange = async (checked: boolean) => {
    setValue('is_required', checked, { shouldDirty: true, shouldTouch: true });
    await trigger('is_required');
  };

  const handleIsActiveChange = async (checked: boolean) => {
    setValue('is_active', checked, { shouldDirty: true, shouldTouch: true });
    await trigger('is_active');
  };

  return (
    <Modal controller={controller} title="Requirement Details" size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-2">
        <div className="space-y-1">
          <Label htmlFor="name">Name</Label>
          <Input
            {...register('name')}
            type="text"
            id="name"
            disabled={isSaving}
            aria-describedby={errors.name ? 'name-error' : undefined}
          />
          {errors.name && (
            <p id="name-error" className="mt-1 text-sm text-red-600">
              {errors.name.message}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <Label htmlFor="description">Description</Label>
          <Textarea
            {...register('description')}
            id="description"
            rows={3}
            disabled={isSaving}
            aria-describedby={errors.description ? 'description-error' : undefined}
          />
          {errors.description && (
            <p id="description-error" className="mt-1 text-sm text-red-600">
              {errors.description.message}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <Label htmlFor="role">Role</Label>
          <Select value={watchedRole} onValueChange={handleRoleChange} disabled={isSaving}>
            <SelectTrigger id="role" aria-describedby={errors.role ? 'role-error' : undefined}>
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="renter">Renter</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
          {errors.role && (
            <p id="role-error" className="mt-1 text-sm text-red-600">
              {errors.role.message}
            </p>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="is_required"
            checked={watchedIsRequired}
            onCheckedChange={handleIsRequiredChange}
            disabled={isSaving}
            aria-describedby="is_required-description"
          />
          <Label htmlFor="is_required">Required</Label>
        </div>
        <p id="is_required-description" className="text-sm text-gray-500">
          Mark this requirement as mandatory for users
        </p>

        <div className="flex items-center space-x-2">
          <Switch
            id="is_active"
            checked={watchedIsActive}
            onCheckedChange={handleIsActiveChange}
            disabled={isSaving}
            aria-describedby="is_active-description"
          />
          <Label htmlFor="is_active">Active</Label>
        </div>
        <p id="is_active-description" className="text-sm text-gray-500">
          Enable or disable this requirement
        </p>

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
