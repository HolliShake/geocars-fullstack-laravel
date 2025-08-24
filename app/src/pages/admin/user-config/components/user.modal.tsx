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
import { renderError } from '@/lib/error';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateUser, useUpdateUser } from '@rest/api';
import type { User } from '@rest/models';
import { Loader2 } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const schema = z.object({
  id: z.number().optional(),
  firstname: z.string().min(1, 'First name is required'),
  lastname: z.string().min(1, 'Last name is required'),
  username: z.string().min(1, 'Username is required'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  country: z.string().min(1, 'Country is required'),
  city: z.string().min(1, 'City is required'),
  address: z.string().min(1, 'Address is required'),
  postal_code: z.string().min(1, 'Postal code is required'),
  email: z.email('Invalid email address'),
  role: z.string().min(1, 'Role is required'),
  is_active: z.boolean(),
});

type Schema = z.infer<typeof schema>;

const field = () => ({
  firstname: '',
  lastname: '',
  username: '',
  phone: '',
  country: '',
  city: '',
  address: '',
  postal_code: '',
  email: '',
  role: 'user',
  is_active: true,
});

export default function UserModal({
  controller,
}: {
  controller: ModalState<User>;
}): React.ReactElement {
  const {
    handleSubmit,
    register,
    reset,
    setError,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Schema>({
    defaultValues: field(),
    resolver: zodResolver(schema),
    mode: 'all',
  });

  const { mutateAsync: createUser, isPending: isCreating } = useCreateUser();
  const { mutateAsync: updateUser, isPending: isUpdating } = useUpdateUser();

  const isEdit = useMemo(() => {
    return !!controller.data?.id;
  }, [controller.data]);

  const isSaving = useMemo(() => isCreating || isUpdating, [isCreating, isUpdating]);

  const watchedRole = watch('role');
  const watchedIsActive = watch('is_active');

  const onSubmit = async (data: Schema) => {
    try {
      if (isEdit) {
        await updateUser({
          id: controller.data?.id || 0,
          data: {
            ...controller?.data,
            ...data,
          } as User,
        });
      } else {
        await createUser({
          data: data as User,
        });
      }
      controller.closeFn();
      toast.success(`User ${isEdit ? 'updated' : 'created'} successfully!`);
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
    <Modal controller={controller} title={isEdit ? 'Edit User' : 'Create User'} size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="firstname" className="block text-sm font-medium text-gray-700">
              First Name <span className="text-red-500">*</span>
            </label>
            <Input
              {...register('firstname')}
              type="text"
              id="firstname"
              disabled={isSaving}
              className={errors.firstname ? 'border-red-500' : ''}
              aria-describedby={errors.firstname ? 'firstname-error' : undefined}
            />
            {errors.firstname && (
              <p id="firstname-error" className="mt-1 text-sm text-red-600">
                {errors.firstname.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="lastname" className="block text-sm font-medium text-gray-700">
              Last Name <span className="text-red-500">*</span>
            </label>
            <Input
              {...register('lastname')}
              type="text"
              id="lastname"
              disabled={isSaving}
              className={errors.lastname ? 'border-red-500' : ''}
              aria-describedby={errors.lastname ? 'lastname-error' : undefined}
            />
            {errors.lastname && (
              <p id="lastname-error" className="mt-1 text-sm text-red-600">
                {errors.lastname.message}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username <span className="text-red-500">*</span>
            </label>
            <Input
              {...register('username')}
              type="text"
              id="username"
              disabled={isSaving}
              className={errors.username ? 'border-red-500' : ''}
              aria-describedby={errors.username ? 'username-error' : undefined}
            />
            {errors.username && (
              <p id="username-error" className="mt-1 text-sm text-red-600">
                {errors.username.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email <span className="text-red-500">*</span>
            </label>
            <Input
              {...register('email')}
              type="email"
              id="email"
              disabled={isSaving}
              className={errors.email ? 'border-red-500' : ''}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
            {errors.email && (
              <p id="email-error" className="mt-1 text-sm text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <Input
            {...register('phone')}
            type="tel"
            id="phone"
            disabled={isSaving}
            className={errors.phone ? 'border-red-500' : ''}
            aria-describedby={errors.phone ? 'phone-error' : undefined}
          />
          {errors.phone && (
            <p id="phone-error" className="mt-1 text-sm text-red-600">
              {errors.phone.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="country" className="block text-sm font-medium text-gray-700">
              Country <span className="text-red-500">*</span>
            </label>
            <Input
              {...register('country')}
              type="text"
              id="country"
              disabled={isSaving}
              className={errors.country ? 'border-red-500' : ''}
              aria-describedby={errors.country ? 'country-error' : undefined}
            />
            {errors.country && (
              <p id="country-error" className="mt-1 text-sm text-red-600">
                {errors.country.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="city" className="block text-sm font-medium text-gray-700">
              City <span className="text-red-500">*</span>
            </label>
            <Input
              {...register('city')}
              type="text"
              id="city"
              disabled={isSaving}
              className={errors.city ? 'border-red-500' : ''}
              aria-describedby={errors.city ? 'city-error' : undefined}
            />
            {errors.city && (
              <p id="city-error" className="mt-1 text-sm text-red-600">
                {errors.city.message}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
              Address <span className="text-red-500">*</span>
            </label>
            <Input
              {...register('address')}
              type="text"
              id="address"
              disabled={isSaving}
              className={errors.address ? 'border-red-500' : ''}
              aria-describedby={errors.address ? 'address-error' : undefined}
            />
            {errors.address && (
              <p id="address-error" className="mt-1 text-sm text-red-600">
                {errors.address.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700">
              Postal Code <span className="text-red-500">*</span>
            </label>
            <Input
              {...register('postal_code')}
              type="text"
              id="postal_code"
              disabled={isSaving}
              className={errors.postal_code ? 'border-red-500' : ''}
              aria-describedby={errors.postal_code ? 'postal_code-error' : undefined}
            />
            {errors.postal_code && (
              <p id="postal_code-error" className="mt-1 text-sm text-red-600">
                {errors.postal_code.message}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="role" className="block text-sm font-medium text-gray-700">
              Role <span className="text-red-500">*</span>
            </label>
            <Select
              value={watchedRole}
              onValueChange={(value) => setValue('role', value)}
              disabled={isSaving}
            >
              <SelectTrigger
                id="role"
                className={errors.role ? 'border-red-500' : ''}
                aria-describedby={errors.role ? 'role-error' : undefined}
              >
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="renter">Renter</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && (
              <p id="role-error" className="mt-1 text-sm text-red-600">
                {errors.role.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="is_active" className="block text-sm font-medium text-gray-700">
              Active Status
            </label>
            <div className="flex items-center space-x-2 pt-1">
              <Switch
                id="is_active"
                checked={watchedIsActive}
                onCheckedChange={(checked) => setValue('is_active', checked)}
                disabled={isSaving}
                aria-describedby="is_active-description"
              />
              <Label htmlFor="is_active" className="text-sm">
                {watchedIsActive ? 'Active' : 'Inactive'}
              </Label>
            </div>
            <p id="is_active-description" className="text-xs text-gray-500">
              Determines if the user can access the system
            </p>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-6 border-t">
          <Button
            type="button"
            onClick={controller.closeFn}
            variant="outline"
            color="secondary"
            disabled={isSaving}
            className="px-6"
          >
            Cancel
          </Button>
          <Button type="submit" variant="default" disabled={isSaving} className="px-6">
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
