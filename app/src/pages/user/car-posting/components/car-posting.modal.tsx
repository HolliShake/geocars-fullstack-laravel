/* eslint-disable react-hooks/exhaustive-deps */
import Modal, { type ModalState } from '@/components/custom/modal.component';
import RichTextEditor from '@/components/custom/richtext.component';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { renderError } from '@/lib/error';
import { cn } from '@/lib/utils';
import useCompanyStore from '@/store/company.store';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateCarPosting, useGetCarPaginated, useUpdateCarPosting } from '@rest/api';
import type { CarPosting } from '@rest/models';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const schema = z.object({
  id: z.number().optional(),
  car_id: z.number().min(1, 'Car is required'),
  company_id: z.number().min(1, 'Company is required'),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.number().min(0, 'Price must be a positive number'),
  force_enabled: z.boolean(),
});

type Schema = z.infer<typeof schema>;

const field = () => ({
  car_id: 0,
  company_id: 0,
  start_date: '',
  end_date: '',
  description: '',
  price: 0,
  force_enabled: false,
});

export default function CarPostingModal({
  controller,
}: {
  controller: ModalState<CarPosting>;
}): React.ReactElement {
  const { selectedCompany } = useCompanyStore();
  const { id: companyId } = selectedCompany ?? { id: 0 };
  const [selectedCarIndex, setSelectedCarIndex] = useState(0);
  const [descriptionContent, setDescriptionContent] = useState<string>('');

  const {
    handleSubmit,
    register,
    reset,
    setError,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Schema>({
    defaultValues: { ...field(), company_id: companyId },
    resolver: zodResolver(schema),
    mode: 'all',
  });

  const { mutateAsync: createCarPosting, isPending: isCreating } = useCreateCarPosting();
  const { mutateAsync: updateCarPosting, isPending: isUpdating } = useUpdateCarPosting();

  // Fetch cars for the selected company
  const { data: carsData } = useGetCarPaginated(
    {
      search: '',
      page: 1,
      rows: Number.MAX_SAFE_INTEGER,
      user_company_id: companyId,
    },
    {
      query: {
        enabled: !!companyId,
      },
    }
  );

  const isEdit = useMemo(() => {
    return !!controller.data?.id;
  }, [controller.data]);

  const isSaving = useMemo(() => isCreating || isUpdating, [isCreating, isUpdating]);

  const cars = useMemo(() => {
    if (!carsData?.data?.data) return [];
    return carsData.data.data;
  }, [carsData]);

  const selectedCar = useMemo(() => {
    return cars[selectedCarIndex] || null;
  }, [cars, selectedCarIndex]);

  const handlePrevious = () => {
    setSelectedCarIndex((prev) => (prev === 0 ? cars.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setSelectedCarIndex((prev) => (prev === cars.length - 1 ? 0 : prev + 1));
  };

  const handleCarSelect = (carId: number) => {
    setValue('car_id', carId);
    const index = cars.findIndex((car) => car.id === carId);
    if (index !== -1) {
      setSelectedCarIndex(index);
    }
  };

  const onSubmit = async (data: Schema) => {
    try {
      const formData = {
        ...data,
        description: descriptionContent,
      };

      if (isEdit) {
        await updateCarPosting({
          id: controller.data?.id || 0,
          data: {
            ...controller?.data,
            ...formData,
          } as CarPosting,
        });
      } else {
        await createCarPosting({
          data: formData as CarPosting,
        });
      }
      controller.closeFn();
      toast.success('Car posting submitted successfully!');
    } catch (error) {
      renderError(error, setError);
    }
  };

  useEffect(() => {
    if (!controller?.data) {
      reset({ ...field(), company_id: companyId });
      setDescriptionContent('');
      return;
    }
    reset({
      ...controller.data,
      company_id: companyId,
    });
    // Set description content from existing data
    setDescriptionContent(controller.data.description || '');
    // Set selected car index based on existing data
    if (controller.data.car_id && cars.length > 0) {
      const index = cars.findIndex((car) => car.id === controller.data?.car_id);
      if (index !== -1) {
        setSelectedCarIndex(index);
      }
    }
  }, [controller, companyId, cars, reset]);

  useEffect(() => {
    if (selectedCar?.id) {
      setValue('car_id', selectedCar.id);
    }
  }, [selectedCar, setValue]);

  return (
    <Modal
      controller={controller}
      title={isEdit ? 'Edit Car Posting' : 'Create Car Posting'}
      size="4xl"
    >
      <article className="max-w-none">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Car Selection Section */}
          <section className="space-y-4">
            <header>
              <h3 className="text-lg font-medium text-foreground">Vehicle Selection</h3>
              <p className="text-sm text-muted-foreground mt-1">Choose the car for this posting</p>
            </header>

            {cars.length > 0 ? (
              <div className="space-y-4">
                {/* Car Display */}
                <div className="relative overflow-hidden rounded-xl border bg-card">
                  <div className="relative aspect-[21/9] bg-muted">
                    {selectedCar?.image_url ? (
                      <img
                        src={selectedCar.image_url}
                        alt={`${selectedCar.brand} ${selectedCar.model}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-muted">
                        <span className="text-muted-foreground">No image available</span>
                      </div>
                    )}

                    {/* Navigation Controls */}
                    {cars.length > 1 && (
                      <>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/90 backdrop-blur-sm hover:bg-background shadow-md"
                          onClick={handlePrevious}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/90 backdrop-blur-sm hover:bg-background shadow-md"
                          onClick={handleNext}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </>
                    )}

                    {/* Car Information */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6">
                      <h4 className="text-white font-semibold text-lg">
                        {selectedCar?.brand} {selectedCar?.model}
                      </h4>
                      <p className="text-white/90 text-sm mt-1">
                        {selectedCar?.plate_number} • {selectedCar?.type}
                      </p>
                    </div>
                  </div>

                  {/* Car Thumbnails */}
                  {cars.length > 1 && (
                    <div className="p-4 border-t bg-muted/30">
                      <div className="flex gap-3 overflow-x-auto pb-2">
                        {cars.map((car, index) => (
                          <button
                            key={car.id}
                            type="button"
                            onClick={() => handleCarSelect(car.id!)}
                            className={cn(
                              'flex-shrink-0 w-16 h-10 rounded-lg border-2 overflow-hidden transition-all hover:scale-105',
                              selectedCarIndex === index
                                ? 'border-primary ring-2 ring-primary/20 shadow-md'
                                : 'border-border hover:border-muted-foreground'
                            )}
                          >
                            {car.image_url ? (
                              <img
                                src={car.image_url}
                                alt={`${car.brand} ${car.model}`}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-muted flex items-center justify-center">
                                <span className="text-xs text-muted-foreground">No img</span>
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                      <div className="text-center mt-3">
                        <span className="text-xs text-muted-foreground">
                          {selectedCarIndex + 1} of {cars.length} vehicles
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {errors.car_id && (
                  <p className="text-sm text-destructive">{errors.car_id.message}</p>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground rounded-xl border border-dashed">
                <p>No vehicles available for this company</p>
              </div>
            )}
          </section>

          {/* Posting Details Section */}
          <section className="space-y-6">
            <header>
              <h3 className="text-lg font-medium text-foreground">Posting Details</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Configure the rental period and pricing
              </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="start_date" className="text-sm font-medium text-foreground">
                  Start Date & Time
                </Label>
                <Input
                  {...register('start_date')}
                  type="datetime-local"
                  id="start_date"
                  className="w-full"
                />
                {errors.start_date && (
                  <p className="text-sm text-destructive">{errors.start_date.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="end_date" className="text-sm font-medium text-foreground">
                  End Date & Time
                </Label>
                <Input
                  {...register('end_date')}
                  type="datetime-local"
                  id="end_date"
                  className="w-full"
                />
                {errors.end_date && (
                  <p className="text-sm text-destructive">{errors.end_date.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price" className="text-sm font-medium text-foreground">
                Rental Price
              </Label>
              <Input
                {...register('price', { valueAsNumber: true })}
                type="number"
                id="price"
                step="0.01"
                min="0"
                placeholder="Enter price per day"
                className="w-full"
              />
              {errors.price && <p className="text-sm text-destructive">{errors.price.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium text-foreground">
                Description
              </Label>
              <RichTextEditor
                value={descriptionContent}
                onChange={setDescriptionContent}
                placeholder="Describe the car, rental terms, or any special conditions..."
                className="min-h-[200px]"
                showToolbar={true}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
              <div className="space-y-1">
                <Label htmlFor="force_enabled" className="text-sm font-medium text-foreground">
                  Force Enable Posting
                </Label>
                <p className="text-xs text-muted-foreground">
                  Override availability checks and enable this posting immediately
                </p>
              </div>
              <Switch
                {...register('force_enabled')}
                id="force_enabled"
                checked={watch('force_enabled')}
                onCheckedChange={(checked) => setValue('force_enabled', checked)}
              />
            </div>
            {errors.force_enabled && (
              <p className="text-sm text-destructive">{errors.force_enabled.message}</p>
            )}
          </section>

          {/* Actions */}
          <footer className="flex justify-end gap-3 pt-6 border-t">
            <Button type="button" onClick={controller.closeFn} variant="outline" size="default">
              Cancel
            </Button>
            <Button type="submit" variant="default" size="default" disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSaving ? 'Saving...' : isEdit ? 'Update Posting' : 'Create Posting'}
            </Button>
          </footer>
        </form>
      </article>
    </Modal>
  );
}
