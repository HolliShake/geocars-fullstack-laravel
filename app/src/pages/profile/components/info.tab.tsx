import Modal, { useModal } from '@/components/custom/modal.component';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AtSign,
  CheckCircle,
  Edit3,
  Globe,
  Home,
  Mail,
  MapPin,
  Phone,
  Shield,
  User,
} from 'lucide-react';
import type React from 'react';
import { useForm } from 'react-hook-form';
import z from 'zod';

const schema = z.object({
  firstname: z.string().min(1, 'First name is required'),
  lastname: z.string().min(1, 'Last name is required'),
  username: z.string().min(1, 'Username is required'),
  email: z.email('Invalid email address'),
  phone: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  address: z.string().optional(),
  postal_code: z.string().optional(),
  role: z.string().optional(),
  is_active: z.boolean().optional(),
});

type FormData = z.infer<typeof schema>;

type Field = {
  key: keyof FormData;
  label: string;
  value: string;
  type:
    | 'text'
    | 'password'
    | 'email'
    | 'phone'
    | 'select'
    | 'checkbox'
    | 'switch'
    | 'number'
    | 'date';
  icon: React.ReactNode;
  isEditable: boolean;
  isRequired: boolean;
  options?: string[]; // for select
};

export default function InfoTab(): React.ReactElement {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstname: 'John',
      lastname: 'Doe',
      username: 'johndoe',
      email: 'john.doe@example.com',
      phone: '+1 (555) 123-4567',
      country: 'United States',
      city: 'San Francisco',
      address: '123 Main Street',
      postal_code: '94105',
    },
  });

  const controller = useModal<Field>();

  const onSubmit = async (data: FormData) => {
    try {
      console.log('Form data:', data);
      // TODO: Implement API call to update profile
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const fields: Field[] = [
    {
      key: 'firstname',
      label: 'First Name',
      value: 'John',
      type: 'text',
      icon: <User className="h-4 w-4" />,
      isEditable: true,
      isRequired: true,
    },
    {
      key: 'lastname',
      label: 'Last Name',
      value: 'Doe',
      type: 'text',
      icon: <User className="h-4 w-4" />,
      isEditable: true,
      isRequired: true,
    },
    {
      key: 'username',
      label: 'Username',
      value: 'johndoe',
      type: 'text',
      icon: <AtSign className="h-4 w-4" />,
      isEditable: true,
      isRequired: true,
    },
    {
      key: 'email',
      label: 'Email',
      value: 'john.doe@example.com',
      type: 'email',
      icon: <Mail className="h-4 w-4" />,
      isEditable: true,
      isRequired: true,
    },
    {
      key: 'phone',
      label: 'Phone',
      value: '+1 (555) 123-4567',
      type: 'phone',
      icon: <Phone className="h-4 w-4" />,
      isEditable: true,
      isRequired: false,
    },
    {
      key: 'country',
      label: 'Country',
      value: 'United States',
      type: 'text',
      icon: <Globe className="h-4 w-4" />,
      isEditable: true,
      isRequired: false,
    },
    {
      key: 'city',
      label: 'City',
      value: 'San Francisco',
      type: 'text',
      icon: <MapPin className="h-4 w-4" />,
      isEditable: true,
      isRequired: false,
    },
    {
      key: 'address',
      label: 'Address',
      value: '123 Main Street',
      type: 'text',
      icon: <Home className="h-4 w-4" />,
      isEditable: true,
      isRequired: false,
    },
    {
      key: 'postal_code',
      label: 'Postal Code',
      value: '94102',
      type: 'text',
      icon: <MapPin className="h-4 w-4" />,
      isEditable: true,
      isRequired: false,
    },
    {
      key: 'role',
      label: 'Role',
      value: 'User',
      type: 'select',
      icon: <Shield className="h-4 w-4" />,
      isEditable: false,
      isRequired: true,
    },
    {
      key: 'is_active',
      label: 'Status',
      value: 'Active',
      type: 'checkbox',
      icon: <CheckCircle className="h-4 w-4" />,
      isEditable: false,
      isRequired: false,
    },
  ];

  return (
    <>
      <Card className="shadow-lg bg-card/50 backdrop-blur-sm border-border">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Personal Information
              </CardTitle>
              <CardDescription className="mt-1 text-muted-foreground">
                Update your personal details and contact information.
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-border hover:bg-gradient-to-r hover:from-cyan-500/10 hover:via-blue-500/10 hover:to-purple-500/10 rounded-lg transition-all duration-300"
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </CardHeader>
        <Separator className="bg-border" />
        <CardContent className="pt-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {fields.map((field) => {
              return (
                <Card
                  aria-disabled={!field.isEditable}
                  key={field.key}
                  className="cursor-pointer group relative p-4 space-y-3 border-border bg-card/40 backdrop-blur-sm hover:bg-gradient-to-br hover:from-cyan-500/5 hover:via-blue-500/5 hover:to-purple-500/5 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10 rounded-lg"
                  onClick={() => {
                    if (field.isEditable) controller.openFn(field);
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 p-2 rounded-lg bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-purple-500/10 group-hover:from-cyan-500/20 group-hover:via-blue-500/20 group-hover:to-purple-500/20 transition-all duration-300">
                      {field.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <label className="block text-sm font-medium text-foreground group-hover:text-cyan-400 transition-colors duration-300">
                        {field.label}
                        {field.isRequired && (
                          <span className="text-destructive ml-1 opacity-75">*</span>
                        )}
                      </label>
                      <p className="mt-1 text-sm text-muted-foreground truncate group-hover:text-foreground/80 transition-colors duration-300">
                        {field.value}
                      </p>
                    </div>
                    {field.isEditable && (
                      <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Edit3 className="h-3 w-3 text-muted-foreground hover:text-cyan-400 transition-colors duration-200" />
                      </div>
                    )}
                  </div>
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyan-500/0 via-blue-500/0 to-purple-500/0 group-hover:from-cyan-500/5 group-hover:via-blue-500/5 group-hover:to-purple-500/5 transition-all duration-500 pointer-events-none" />
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
      <Modal controller={controller}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {(() => {
            if (!controller.data) return null;

            const field = controller.data;

            switch (field.type) {
              case 'text':
              case 'email':
              case 'phone':
                return (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-foreground">
                        {field.label}
                        {field.isRequired && <span className="text-destructive ml-1">*</span>}
                      </label>
                      <Input
                        type={field.type}
                        {...register(field.key)}
                        defaultValue={field.value}
                        className="border-border focus:ring-ring"
                      />
                      {errors[field.key] && (
                        <p className="text-destructive text-sm mt-1">
                          {errors[field.key]?.message}
                        </p>
                      )}
                    </div>
                  </div>
                );

              case 'password':
                return (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-foreground">
                        {field.label}
                        {field.isRequired && <span className="text-destructive ml-1">*</span>}
                      </label>
                      <Input
                        type="password"
                        {...register(field.key)}
                        className="border-border focus:ring-ring"
                      />
                      {errors[field.key] && (
                        <p className="text-destructive text-sm mt-1">
                          {errors[field.key]?.message}
                        </p>
                      )}
                    </div>
                  </div>
                );

              case 'select':
                return (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-foreground">
                        {field.label}
                        {field.isRequired && <span className="text-destructive ml-1">*</span>}
                      </label>
                      <Select {...register(field.key)} defaultValue={field.value}>
                        <SelectTrigger className="w-full border-border focus:ring-ring">
                          <SelectValue placeholder="Select an option" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border">
                          {field.options?.map((option) => (
                            <SelectItem
                              key={option}
                              value={option}
                              className="text-popover-foreground"
                            >
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors[field.key] && (
                        <p className="text-destructive text-sm mt-1">
                          {errors[field.key]?.message}
                        </p>
                      )}
                    </div>
                  </div>
                );

              case 'checkbox':
                return (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        {...register(field.key)}
                        defaultChecked={field.value === 'true'}
                        className="border-border data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                      />
                      <label className="text-sm font-medium text-foreground">{field.label}</label>
                    </div>
                    {errors[field.key] && (
                      <p className="text-destructive text-sm">{errors[field.key]?.message}</p>
                    )}
                  </div>
                );

              case 'switch':
                return (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-foreground">{field.label}</label>
                      <Switch
                        {...register(field.key)}
                        defaultChecked={field.value === 'true'}
                        className="data-[state=checked]:bg-primary"
                      />
                    </div>
                    {errors[field.key] && (
                      <p className="text-destructive text-sm">{errors[field.key]?.message}</p>
                    )}
                  </div>
                );

              case 'number':
                return (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-foreground">
                        {field.label}
                        {field.isRequired && <span className="text-destructive ml-1">*</span>}
                      </label>
                      <Input
                        type="number"
                        {...register(field.key)}
                        defaultValue={field.value}
                        className="border-border focus:ring-ring"
                      />
                      {errors[field.key] && (
                        <p className="text-destructive text-sm mt-1">
                          {errors[field.key]?.message}
                        </p>
                      )}
                    </div>
                  </div>
                );

              case 'date':
                return (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-foreground">
                        {field.label}
                        {field.isRequired && <span className="text-destructive ml-1">*</span>}
                      </label>
                      <Input
                        type="date"
                        {...register(field.key)}
                        defaultValue={field.value}
                        className="border-border focus:ring-ring"
                      />
                      {errors[field.key] && (
                        <p className="text-destructive text-sm mt-1">
                          {errors[field.key]?.message}
                        </p>
                      )}
                    </div>
                  </div>
                );

              default:
                return (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">Unsupported field type</p>
                  </div>
                );
            }
          })()}
          <div className="flex justify-end space-x-2 mt-6 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => controller.closeFn()}
              className="border-border hover:bg-secondary"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 hover:from-cyan-600 hover:via-blue-600 hover:to-purple-700 text-primary-foreground"
            >
              Save
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
