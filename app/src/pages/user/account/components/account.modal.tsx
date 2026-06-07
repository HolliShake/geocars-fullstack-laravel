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
import type { UserAccount } from '@rest/user-account.custom';
import {
  useCreateUserAccount,
  useUpdateUserAccount,
  type UserAccountType,
} from '@rest/user-account.custom';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const accountTypes: UserAccountType[] = ['Bank', 'GCash', 'Maya'];

const schema = z.object({
  id: z.number().optional(),
  user_id: z.number().min(1, 'User ID is required'),
  type: z.enum(['Bank', 'GCash', 'Maya']),
  account_number: z.string().min(1, 'Account number is required').max(255),
  is_default: z.boolean(),
});

type Schema = z.infer<typeof schema>;

const field = (userId = 0): Schema => ({
  user_id: userId,
  type: 'Bank',
  account_number: '',
  is_default: false,
});

export default function UserAccountModal({
  controller,
  successFn = undefined,
}: {
  controller: ModalState<UserAccount>;
  successFn?: () => void;
}): React.ReactElement {
  const { token } = useAuth();
  const userId = parseInt((getJwtContent(token ?? '', 'sub') as string) || '0', 10);

  const {
    handleSubmit,
    register,
    reset,
    setError,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Schema>({
    defaultValues: field(userId),
    resolver: zodResolver(schema),
    mode: 'all',
  });

  const { mutateAsync: createUserAccount, isPending: isCreating } = useCreateUserAccount();
  const { mutateAsync: updateUserAccount, isPending: isUpdating } = useUpdateUserAccount();

  const isEdit = useMemo(() => !!controller.data?.id, [controller.data]);
  const isSaving = useMemo(() => isCreating || isUpdating, [isCreating, isUpdating]);
  const selectedType = watch('type');

  const onSubmit = async (data: Schema) => {
    try {
      if (isEdit) {
        await updateUserAccount({
          id: controller.data?.id || 0,
          data: {
            ...controller.data,
            ...data,
          },
        });
      } else {
        await createUserAccount({
          data,
        });
      }

      controller.closeFn();
      toast.success('Account saved successfully!');
      successFn?.();
    } catch (error) {
      renderError(error, setError);
    }
  };

  useEffect(() => {
    if (!controller.data) {
      reset(field(userId));
      return;
    }

    reset({
      id: controller.data.id,
      user_id: userId,
      type: controller.data.type,
      account_number: controller.data.account_number,
      is_default: controller.data.is_default,
    });
  }, [controller.data, reset, userId]);

  return (
    <Modal controller={controller} title={isEdit ? 'Edit Account' : 'Add Account'} size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <input type="hidden" {...register('user_id', { valueAsNumber: true })} />

        <div className="space-y-2">
          <Label htmlFor="type">Account Type</Label>
          <div className="grid grid-cols-3 gap-2">
            {accountTypes.map((type) => (
              <Button
                key={type}
                type="button"
                variant={selectedType === type ? 'default' : 'outline'}
                onClick={() => setValue('type', type, { shouldValidate: true })}
                disabled={isSaving}
              >
                {type}
              </Button>
            ))}
          </div>
          {errors.type && <p className="text-sm text-destructive">{errors.type.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="account_number">Account Number</Label>
          <Input
            id="account_number"
            type="text"
            disabled={isSaving}
            {...register('account_number')}
            placeholder="Enter bank account or e-wallet number"
          />
          {errors.account_number && (
            <p className="text-sm text-destructive">{errors.account_number.message}</p>
          )}
        </div>

        <div className="flex items-center space-x-3 rounded-lg border p-3">
          <Checkbox
            id="is_default"
            checked={watch('is_default')}
            disabled={isSaving}
            onCheckedChange={(checked) =>
              setValue('is_default', checked === true, {
                shouldValidate: true,
              })
            }
          />
          <Label htmlFor="is_default">Set as default payout account</Label>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={controller.closeFn} disabled={isSaving}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Saving...' : isEdit ? 'Update Account' : 'Create Account'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
