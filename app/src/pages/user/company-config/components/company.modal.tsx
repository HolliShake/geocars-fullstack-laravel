/* eslint-disable react-hooks/exhaustive-deps */
import { useAuth } from '@/components/auth.provider';
import Modal, { type ModalState } from '@/components/custom/modal.component';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { renderError } from '@/lib/error';
import getJwtContent from '@/lib/jwt';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateUserCompany, useUpdateUserCompany } from '@rest/api';
import type { UserCompany } from '@rest/models';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const schema = z.object({
  id: z.number().optional(),
  user_id: z.number().min(1, 'User ID is required'),
  name: z.string().min(1, 'Company name is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  country: z.string().min(1, 'Country is required'),
  postal_code: z.string().min(1, 'Postal code is required'),
  opening_time: z.string().min(1, 'Opening time is required'),
  closing_time: z.string().min(1, 'Closing time is required'),
  days_open: z.array(z.string()).min(1, 'At least one day must be selected'),
});

type Schema = z.infer<typeof schema>;

const defaultDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const field = () => ({
  user_id: 0,
  name: '',
  address: '',
  city: '',
  country: '',
  postal_code: '',
  opening_time: '',
  closing_time: '',
  days_open: defaultDays,
});

export default function UserCompanyModal({
  controller,
}: {
  controller: ModalState<UserCompany>;
}): React.ReactElement {
  const { token } = useAuth();
  const user_id = parseInt((getJwtContent(token ?? '', 'sub') as string) || '0');
  const {
    handleSubmit,
    register,
    reset,
    setError,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Schema>({
    defaultValues: {
      ...field(),
      user_id: user_id,
    },
    resolver: zodResolver(schema),
    mode: 'all',
  });

  const { mutateAsync: createUserCompany, isPending: isCreating } = useCreateUserCompany();
  const { mutateAsync: updateUserCompany, isPending: isUpdating } = useUpdateUserCompany();

  const isEdit = useMemo(() => {
    return !!controller.data?.id;
  }, [controller.data]);

  const isSaving = useMemo(() => isCreating || isUpdating, [isCreating, isUpdating]);

  const watchedDaysOpen = watch('days_open');

  const handleDayToggle = (day: string) => {
    const currentDays = watchedDaysOpen || [];
    if (currentDays.includes(day)) {
      setValue(
        'days_open',
        currentDays.filter((d) => d !== day)
      );
    } else {
      setValue('days_open', [...currentDays, day]);
    }
  };

  const onSubmit = async (data: Schema) => {
    try {
      // Format time values to H:i format (remove leading zeros from hours)
      const formatTime = (time: string) => {
        const [hours, minutes] = time.split(':');
        return `${parseInt(hours, 10)}:${minutes}`;
      };

      const formattedData = {
        ...data,
        opening_time: formatTime(data.opening_time),
        closing_time: formatTime(data.closing_time),
        days_open: data.days_open.join(','),
      };

      if (isEdit) {
        await updateUserCompany({
          id: controller.data?.id || 0,
          data: {
            ...controller?.data,
            ...formattedData,
          } as UserCompany,
        });
      } else {
        await createUserCompany({
          data: formattedData as UserCompany,
        });
      }
      controller.closeFn();
      toast.success('User company submitted successfully!');
    } catch (error) {
      renderError(error, setError);
    }
  };

  useEffect(() => {
    if (!controller?.data) return reset({ ...field(), user_id: user_id });
    reset({
      ...controller.data,
      user_id: user_id,
      days_open: controller.data.days_open?.split(',') || defaultDays,
    });
  }, [controller.data]);

  return (
    <Modal controller={controller} title="User Company Details" size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4">
        {/* Basic Information Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium border-b pb-2">Basic Information</h3>

          <div className="grid gap-12 grid-cols-1 lg:grid-cols-">
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Company Name <span className="text-red-500">*</span>
              </label>
              <Input
                {...register('name')}
                type="text"
                id="name"
                disabled={isSaving}
                className={errors.name ? 'border-red-500' : ''}
                aria-describedby={errors.name ? 'name-error' : undefined}
              />
              {errors.name && (
                <p id="name-error" className="mt-1 text-sm text-red-600">
                  {errors.name.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Address Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium border-b pb-2">Address Details</h3>

          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Street Address <span className="text-red-500">*</span>
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
          </div>
        </div>

        {/* Business Hours Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium border-b pb-2">Business Hours</h3>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="opening_time" className="block text-sm font-medium text-gray-700">
                  Opening Time <span className="text-red-500">*</span>
                </label>
                <Input
                  {...register('opening_time')}
                  type="time"
                  id="opening_time"
                  disabled={isSaving}
                  className={errors.opening_time ? 'border-red-500' : ''}
                  aria-describedby={errors.opening_time ? 'opening_time-error' : undefined}
                />
                {errors.opening_time && (
                  <p id="opening_time-error" className="mt-1 text-sm text-red-600">
                    {errors.opening_time?.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="closing_time" className="block text-sm font-medium text-gray-700">
                  Closing Time <span className="text-red-500">*</span>
                </label>
                <Input
                  {...register('closing_time')}
                  type="time"
                  id="closing_time"
                  disabled={isSaving}
                  className={errors.closing_time ? 'border-red-500' : ''}
                  aria-describedby={errors.closing_time ? 'closing_time-error' : undefined}
                />
                {errors.closing_time && (
                  <p id="closing_time-error" className="mt-1 text-sm text-red-600">
                    {errors.closing_time.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Days Open <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-row flex-wrap gap-2">
                {defaultDays.map((day) => (
                  <div
                    key={day}
                    className="border rounded-md p-2 flex items-center space-x-2 transition-colors"
                  >
                    <Checkbox
                      id={day}
                      checked={watchedDaysOpen?.includes(day) || false}
                      onCheckedChange={() => handleDayToggle(day)}
                      disabled={isSaving}
                    />
                    <Label
                      htmlFor={day}
                      className="text-sm font-mono font-medium cursor-pointer select-none flex-1"
                    >
                      {day.slice(0, 3)}
                    </Label>
                  </div>
                ))}
              </div>
              {errors.days_open && (
                <p className="mt-1 text-sm text-red-600">{errors.days_open.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
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
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
