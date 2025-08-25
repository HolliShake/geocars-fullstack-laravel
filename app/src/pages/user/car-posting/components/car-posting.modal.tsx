import Modal, { type ModalState } from '@/components/custom/modal.component';
import RichTextEditor from '@/components/custom/richtext.component';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { renderError } from '@/lib/error';
import { cn } from '@/lib/utils';
import useCompanyStore from '@/store/company.store';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateCarPosting, useGetCarPaginated, useUpdateCarPosting } from '@rest/api';
import type { CarPosting } from '@rest/models';
import {
  Calendar,
  Car,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  FileText,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

// Helper function to format date for datetime-local input
const formatDateForInput = (dateString: string): string => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    // Format as YYYY-MM-DDTHH:mm for datetime-local input
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

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
      is_available: true,
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
      return;
    }
    reset({
      ...controller.data,
      company_id: companyId,
      start_date: formatDateForInput(controller.data.start_date),
      end_date: formatDateForInput(controller.data.end_date),
    });
    // Set description content from existing data
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
          {/* Enhanced Header with Gradient */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-purple-500/5 border border-border/50 p-6">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 via-blue-400/10 to-purple-400/10 backdrop-blur-sm"></div>
            <div className="relative z-10 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-cyan-400/20 via-blue-400/20 to-purple-400/20 border border-border/50">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                  {isEdit ? 'Edit Car Posting' : 'Create New Car Posting'}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Configure your vehicle rental listing with detailed information
                </p>
              </div>
            </div>
          </div>

          {/* Enhanced Car Selection Section */}
          <section className="space-y-6">
            <header className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-cyan-400/20 via-blue-400/20 to-purple-400/20 border border-border/50">
                <Car className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Vehicle Selection</h3>
                <p className="text-sm text-muted-foreground">
                  Choose the perfect car for your rental listing
                </p>
              </div>
            </header>

            {cars.length > 0 ? (
              <div className="space-y-6">
                {/* Enhanced Car Display Card */}
                <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-card via-card to-card/95">
                  <CardContent className="p-0">
                    <div className="relative aspect-[21/9] bg-gradient-to-br from-muted/50 to-muted/30">
                      {selectedCar?.image_url ? (
                        <img
                          src={selectedCar.image_url}
                          alt={`${selectedCar.brand} ${selectedCar.model}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted/50 to-muted/30">
                          <div className="text-center">
                            <Car className="h-12 w-12 text-muted-foreground/50 mx-auto mb-2" />
                            <span className="text-muted-foreground">No image available</span>
                          </div>
                        </div>
                      )}

                      {/* Enhanced Navigation Controls */}
                      {cars.length > 1 && (
                        <>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/95 backdrop-blur-md hover:bg-background shadow-lg border-border/50 hover:border-primary/50 transition-all duration-200"
                            onClick={handlePrevious}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/95 backdrop-blur-md hover:bg-background shadow-lg border-border/50 hover:border-primary/50 transition-all duration-200"
                            onClick={handleNext}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </>
                      )}

                      {/* Enhanced Car Information Overlay */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-white font-bold text-xl mb-1">
                              {selectedCar?.brand} {selectedCar?.model}
                            </h4>
                            <div className="flex items-center gap-4 text-white/90 text-sm">
                              <span className="flex items-center gap-1">
                                <Car className="h-3 w-3" />
                                {selectedCar?.plate_number}
                              </span>
                              <Badge
                                variant="secondary"
                                className="bg-white/20 text-white border-white/30"
                              >
                                {selectedCar?.type}
                              </Badge>
                              <Badge
                                variant="secondary"
                                className="bg-white/20 text-white border-white/30"
                              >
                                {selectedCar?.fuel_type}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-white/90 text-sm">Year</div>
                            <div className="text-white font-semibold">{selectedCar?.year}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Car Thumbnails */}
                    {cars.length > 1 && (
                      <div className="p-6 bg-gradient-to-r from-muted/30 via-muted/20 to-muted/30 border-t border-border/50">
                        <div className="flex gap-3 overflow-x-auto pb-3">
                          {cars.map((car, index) => (
                            <button
                              key={car.id}
                              type="button"
                              onClick={() => handleCarSelect(car.id!)}
                              className={cn(
                                'flex-shrink-0 w-20 h-12 rounded-lg border-2 overflow-hidden transition-all duration-200 hover:scale-105 hover:shadow-md',
                                selectedCarIndex === index
                                  ? 'border-primary ring-2 ring-primary/30 shadow-lg bg-gradient-to-r from-primary/10 to-primary/5'
                                  : 'border-border hover:border-muted-foreground hover:bg-muted/50'
                              )}
                            >
                              {car.image_url ? (
                                <img
                                  src={car.image_url}
                                  alt={`${car.brand} ${car.model}`}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-muted/50 to-muted/30 flex items-center justify-center">
                                  <Car className="h-4 w-4 text-muted-foreground" />
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                        <div className="text-center">
                          <span className="text-xs text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
                            {selectedCarIndex + 1} of {cars.length} vehicles
                          </span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {errors.car_id && (
                  <p className="text-sm text-destructive flex items-center gap-2">
                    <span className="w-1 h-1 bg-destructive rounded-full"></span>
                    {errors.car_id.message}
                  </p>
                )}
              </div>
            ) : (
              <Card className="text-center py-16 border-dashed border-2 bg-gradient-to-br from-muted/30 to-muted/10">
                <CardContent>
                  <Car className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-muted-foreground mb-2">
                    No Vehicles Available
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Add vehicles to your company to create postings
                  </p>
                </CardContent>
              </Card>
            )}
          </section>

          {/* Enhanced Posting Details Section */}
          <section className="space-y-6">
            <header className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-cyan-400/20 via-blue-400/20 to-purple-400/20 border border-border/50">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Posting Details</h3>
                <p className="text-sm text-muted-foreground">
                  Configure the rental period and pricing
                </p>
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-border/50 bg-gradient-to-br from-card to-card/95">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-green-400/20 to-emerald-400/20 border border-border/50">
                      <Calendar className="h-4 w-4 text-green-500" />
                    </div>
                    <Label htmlFor="start_date" className="text-sm font-medium text-foreground">
                      Start Date & Time
                    </Label>
                  </div>
                  <Input
                    {...register('start_date')}
                    type="datetime-local"
                    id="start_date"
                    className="w-full bg-background/50 border-border/50 focus:border-primary/50"
                  />
                  {errors.start_date && (
                    <p className="text-sm text-destructive mt-2 flex items-center gap-2">
                      <span className="w-1 h-1 bg-destructive rounded-full"></span>
                      {errors.start_date.message}
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-gradient-to-br from-card to-card/95">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-red-400/20 to-pink-400/20 border border-border/50">
                      <Calendar className="h-4 w-4 text-red-500" />
                    </div>
                    <Label htmlFor="end_date" className="text-sm font-medium text-foreground">
                      End Date & Time
                    </Label>
                  </div>
                  <Input
                    {...register('end_date')}
                    type="datetime-local"
                    id="end_date"
                    className="w-full bg-background/50 border-border/50 focus:border-primary/50"
                  />
                  {errors.end_date && (
                    <p className="text-sm text-destructive mt-2 flex items-center gap-2">
                      <span className="w-1 h-1 bg-destructive rounded-full"></span>
                      {errors.end_date.message}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card className="border-border/50 bg-gradient-to-br from-card to-card/95">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-yellow-400/20 to-orange-400/20 border border-border/50">
                    <DollarSign className="h-4 w-4 text-yellow-500" />
                  </div>
                  <Label htmlFor="price" className="text-sm font-medium text-foreground">
                    Rental Price
                  </Label>
                </div>
                <Input
                  {...register('price', { valueAsNumber: true })}
                  type="number"
                  id="price"
                  step="0.01"
                  min="0"
                  placeholder="Enter price per day"
                  className="w-full bg-background/50 border-border/50 focus:border-primary/50"
                />
                {errors.price && (
                  <p className="text-sm text-destructive mt-2 flex items-center gap-2">
                    <span className="w-1 h-1 bg-destructive rounded-full"></span>
                    {errors.price.message}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-gradient-to-br from-card to-card/95">
              <CardContent className="p-6 h-fit">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-blue-400/20 to-cyan-400/20 border border-border/50">
                    <FileText className="h-4 w-4 text-blue-500" />
                  </div>
                  <Label htmlFor="description" className="text-sm font-medium text-foreground">
                    Description
                  </Label>
                </div>
                <RichTextEditor
                  value={watch('description')}
                  onChange={(value: string) => setValue('description', value)}
                  placeholder="Describe the car, rental terms, or any special conditions..."
                  showToolbar={true}
                />
                {errors.description && (
                  <p className="text-sm text-destructive mt-2 flex items-center gap-2">
                    <span className="w-1 h-1 bg-destructive rounded-full"></span>
                    {errors.description.message}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-gradient-to-br from-card to-card/95">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-purple-400/20 to-pink-400/20 border border-border/50">
                      <Zap className="h-4 w-4 text-purple-500" />
                    </div>
                    <div className="space-y-1">
                      <Label
                        htmlFor="force_enabled"
                        className="text-sm font-medium text-foreground"
                      >
                        Force Enable Posting
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Override availability checks and enable this posting immediately
                      </p>
                    </div>
                  </div>
                  <Switch
                    {...register('force_enabled')}
                    id="force_enabled"
                    checked={watch('force_enabled')}
                    onCheckedChange={(checked) => setValue('force_enabled', !!checked)}
                  />
                </div>
                {errors.force_enabled && (
                  <p className="text-sm text-destructive mt-2 flex items-center gap-2">
                    <span className="w-1 h-1 bg-destructive rounded-full"></span>
                    {errors.force_enabled.message}
                  </p>
                )}
              </CardContent>
            </Card>
          </section>

          {/* Enhanced Actions Footer */}
          <footer className="flex justify-end gap-3 pt-6 border-t border-border/50 bg-gradient-to-r from-muted/20 via-muted/10 to-muted/20 rounded-lg p-6">
            <Button
              type="button"
              onClick={controller.closeFn}
              variant="outline"
              size="default"
              className="border-border/50 hover:border-border hover:bg-muted/50"
            >
              Cancel
            </Button>
            <Button type="submit" variant="default" size="default" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </footer>
        </form>
      </article>
    </Modal>
  );
}
