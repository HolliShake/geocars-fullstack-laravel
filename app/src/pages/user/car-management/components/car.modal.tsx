/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import Modal, { type ModalState } from '@/components/custom/modal.component';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CarTypeEnum } from '@/constants/car-type.constant';
import { FuelTypeEnum } from '@/constants/fuel-type.constant';
import { TransmissionTypeEnum } from '@/constants/transmission-type.constant';
import { renderError } from '@/lib/error';
import useCompanyStore from '@/store/company.store';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateCar, useUpdateCar } from '@rest/api';
import type { Car } from '@rest/models/car';
import { Loader2, Upload, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const schema = z.object({
  id: z.number().optional(),
  user_company_id: z.number(),
  brand: z.string().min(1, 'Brand is required'),
  model: z.string().min(1, 'Model is required'),
  plate_number: z.string().min(1, 'Plate number is required'),
  color: z.string().min(1, 'Color is required'),
  type: z.string().min(1, 'Type is required'),
  year: z.string().nullable().optional(),
  fuel_type: z.string().min(1, 'Fuel type is required'),
  transmission: z.string().min(1, 'Transmission is required'),
  engine_capacity: z.string().nullable().optional(),
  engine_power: z.string().nullable().optional(),
  engine_torque: z.string().nullable().optional(),
  engine_type: z.string().nullable().optional(),
  images: z.array(z.instanceof(File)).optional(),
});

type Schema = z.infer<typeof schema>;

const field = () => ({
  user_company_id: 0,
  brand: '',
  model: '',
  plate_number: '',
  color: '',
  type: CarTypeEnum.sedan,
  year: '',
  fuel_type: FuelTypeEnum.petrol,
  transmission: TransmissionTypeEnum.manual,
  engine_capacity: '',
  engine_power: '',
  engine_torque: '',
  engine_type: '',
  images: [],
});

export default function UserQuickCarModal({
  controller,
}: {
  controller: ModalState<Car>;
}): React.ReactElement {
  const { selectedCompany } = useCompanyStore();
  const { id: companyId } = selectedCompany ?? { id: 0 };
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const {
    handleSubmit,
    register,
    reset,
    setError,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Schema>({
    defaultValues: { ...field(), user_company_id: companyId },
    resolver: zodResolver(schema),
    mode: 'all',
  });

  const { mutateAsync: createCar, isPending: isCreating } = useCreateCar();
  const { mutateAsync: updateCar, isPending: isUpdating } = useUpdateCar();

  const isEdit = useMemo(() => {
    return !!controller.data?.id;
  }, [controller]);

  const isSaving = useMemo(() => isCreating || isUpdating, [isCreating, isUpdating]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const fileArray = Array.from(files);
      setSelectedFiles(fileArray);
      setValue('images', fileArray);
    }
  };

  const removeFile = (index: number) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updatedFiles);
    setValue('images', updatedFiles);
  };

  const onSubmit = async (data: Schema) => {
    try {
      if (isEdit) {
        await updateCar({
          id: controller.data?.id || 0,
          data: data as any,
        });
      } else {
        await createCar({
          data: data as any,
        });
      }
      controller.closeFn();
      toast.success('Car submitted successfully!');
    } catch (error) {
      renderError(error, setError);
    }
  };

  useEffect(() => {
    if (!controller?.data) {
      reset({ ...field(), user_company_id: companyId });
      setSelectedFiles([]);
      return;
    }
    reset({
      ...controller.data,
      user_company_id: companyId,
      images: [],
    });
    setSelectedFiles([]);
  }, [controller, companyId]);

  return (
    <Modal controller={controller} title="Car Details" size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label htmlFor="brand" className="block text-sm font-medium text-gray-700">
              Brand
            </label>
            <Input {...register('brand')} type="text" id="brand" disabled={isSaving} />
            {errors.brand && <p className="mt-1 text-sm text-red-600">{errors.brand.message}</p>}
          </div>

          <div className="space-y-1">
            <label htmlFor="model" className="block text-sm font-medium text-gray-700">
              Model
            </label>
            <Input {...register('model')} type="text" id="model" disabled={isSaving} />
            {errors.model && <p className="mt-1 text-sm text-red-600">{errors.model.message}</p>}
          </div>

          <div className="space-y-1">
            <label htmlFor="plate_number" className="block text-sm font-medium text-gray-700">
              Plate Number
            </label>
            <Input
              {...register('plate_number')}
              type="text"
              id="plate_number"
              disabled={isSaving}
            />
            {errors.plate_number && (
              <p className="mt-1 text-sm text-red-600">{errors.plate_number.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label htmlFor="color" className="block text-sm font-medium text-gray-700">
              Color
            </label>
            <Input {...register('color')} type="color" id="color" disabled={isSaving} />
            {errors.color && <p className="mt-1 text-sm text-red-600">{errors.color.message}</p>}
          </div>

          <div className="space-y-1">
            <label htmlFor="type" className="block text-sm font-medium text-gray-700">
              Type
            </label>
            <Select
              value={watch('type')}
              onValueChange={(value) => setValue('type', value)}
              disabled={isSaving}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select car type" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CarTypeEnum).map(([key, value]) => (
                  <SelectItem key={key} value={value}>
                    {key}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>}
          </div>

          <div className="space-y-1">
            <label htmlFor="year" className="block text-sm font-medium text-gray-700">
              Year
            </label>
            <Input {...register('year')} type="text" id="year" disabled={isSaving} />
            {errors.year && <p className="mt-1 text-sm text-red-600">{errors.year.message}</p>}
          </div>

          <div className="space-y-1">
            <label htmlFor="fuel_type" className="block text-sm font-medium text-gray-700">
              Fuel Type
            </label>
            <Select
              value={watch('fuel_type')}
              onValueChange={(value) => setValue('fuel_type', value)}
              disabled={isSaving}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select fuel type" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(FuelTypeEnum).map(([key, value]) => (
                  <SelectItem key={key} value={value}>
                    {key}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.fuel_type && (
              <p className="mt-1 text-sm text-red-600">{errors.fuel_type.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label htmlFor="transmission" className="block text-sm font-medium text-gray-700">
              Transmission
            </label>
            <Select
              value={watch('transmission')}
              onValueChange={(value) => setValue('transmission', value)}
              disabled={isSaving}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select transmission" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TransmissionTypeEnum).map(([key, value]) => (
                  <SelectItem key={key} value={value}>
                    {key}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.transmission && (
              <p className="mt-1 text-sm text-red-600">{errors.transmission.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label htmlFor="engine_capacity" className="block text-sm font-medium text-gray-700">
              Engine Capacity
            </label>
            <Input
              {...register('engine_capacity')}
              type="text"
              id="engine_capacity"
              placeholder="e.g., 2.0L"
              disabled={isSaving}
            />
            {errors.engine_capacity && (
              <p className="mt-1 text-sm text-red-600">{errors.engine_capacity.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label htmlFor="engine_power" className="block text-sm font-medium text-gray-700">
              Engine Power
            </label>
            <Input
              {...register('engine_power')}
              type="text"
              id="engine_power"
              placeholder="e.g., 150HP"
              disabled={isSaving}
            />
            {errors.engine_power && (
              <p className="mt-1 text-sm text-red-600">{errors.engine_power.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label htmlFor="engine_torque" className="block text-sm font-medium text-gray-700">
              Engine Torque
            </label>
            <Input
              {...register('engine_torque')}
              type="text"
              id="engine_torque"
              placeholder="e.g., 200Nm"
              disabled={isSaving}
            />
            {errors.engine_torque && (
              <p className="mt-1 text-sm text-red-600">{errors.engine_torque.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label htmlFor="engine_type" className="block text-sm font-medium text-gray-700">
              Engine Type
            </label>
            <Input
              {...register('engine_type')}
              type="text"
              id="engine_type"
              placeholder="e.g., V6, Inline-4"
              disabled={isSaving}
            />
            {errors.engine_type && (
              <p className="mt-1 text-sm text-red-600">{errors.engine_type.message}</p>
            )}
          </div>
        </div>

        {/* File Upload Section */}
        <div className="space-y-4 pt-4 border-t">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Car Images</label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 ease-in-out border-border/50 bg-background/50 hover:bg-muted hover:border-border hover:shadow-lg">
                <div className="flex flex-col items-center justify-center pt-6 pb-6">
                  <div className="w-12 h-12 mb-4 bg-muted rounded-full flex items-center justify-center">
                    <Upload className="w-6 h-6 text-primary" />
                  </div>
                  <p className="mb-2 text-sm text-foreground text-center">
                    <span className="font-semibold text-primary">Click to upload</span> or drag and
                    drop
                  </p>
                  <p className="text-xs text-muted-foreground text-center">
                    PNG, JPG, JPEG, GIF up to 2MB each
                  </p>
                  <p className="text-xs text-primary mt-1 font-medium">Multiple files supported</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  multiple
                  accept="image/*"
                  onChange={handleFileSelect}
                  disabled={isSaving}
                />
              </label>
            </div>

            {/* Selected Files Preview */}
            {selectedFiles.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Selected Files:</p>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {selectedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-50 p-2 rounded"
                    >
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                          <Upload className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="text-sm text-gray-700 truncate max-w-xs">{file.name}</span>
                        <span className="text-xs text-gray-500">
                          ({(file.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        disabled={isSaving}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" onClick={controller.closeFn} variant="outline" color="secondary">
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
