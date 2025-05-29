'use client';
import { createMonitoring } from '@/actions/monitoring';
import { monitoringSchema, MonitoringSchema } from '@/types/monitoring';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@skripsi/components';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

export const AddDevice = ({
  data, // Now an array of Limitations or null
  id,
  idUser,
  emailVerified,
  className,
}: {
  emailVerified?: Date | null;
  data:
    | {
        id: string;
        name: string;
      }[]
    | null;
  idUser: string;
  id?: string; // ID for the DialogTrigger
  className?: string; // className for the DialogTrigger content
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const t = useTranslations('dashboard.monitoring.createDevice');
  const getLocale = useLocale();
  const locale = getLocale === 'id' ? 'id' : 'en';

  const form = useForm<MonitoringSchema>({
    resolver: zodResolver(monitoringSchema(t)),
    defaultValues: {
      nameMonitoring: '',
      limitId: '', // Will be set by useEffect
      locationDevice: '',
    },
  });

  // Effect to reset form and set a default limitId when dialog opens or data changes
  useEffect(() => {
    if (isDialogOpen) {
      form.reset({
        nameMonitoring: '',
        // Set limitId to the first available option if data exists and is not empty
        limitId: data && data.length > 0 ? data[0].id : '',
        locationDevice: '',
      });
    }
    // If not open, but data changes (e.g. parent component re-fetches),
    // and a value was previously set that's no longer valid, clear it.
    // This might be more complex depending on exact UX desired.
    // For now, we only reset/initialize when dialog opens.
  }, [isDialogOpen, data, form]);

  const handleSubmit = async (value: MonitoringSchema) => {
    try {
      if (!value.limitId) {
        toast.error(
          t('error.selectLimit', {
            defaultValue: 'Please select a limit type.', // Changed message slightly
          }),
          { position: 'top-right', autoClose: 5000 },
        );
        return;
      }

      // Check if any limitation data was provided to choose from originally
      if (!data || data.length === 0) {
        toast.error(
          t('error.noLimitData', {
            defaultValue: 'Limitation data is not available to associate with.',
          }),
          { position: 'top-right', autoClose: 5000 },
        );
        return;
      }

      const result = await createMonitoring(
        {
          nameMonitoring: value.nameMonitoring,
          limitId: value.limitId,
          locationDevice: value.locationDevice,
        },
        idUser,
        locale,
      );

      if (!result?.success) {
        toast.error(
          result?.message ||
            t('error.addFailed', {
              defaultValue: 'Failed to add device.',
            }),
          { position: 'top-right', autoClose: 5000 },
        );
      } else {
        toast.success(
          result?.message ||
            t('success.deviceAdded', {
              defaultValue: 'Device added successfully!',
            }),
          { position: 'top-right', autoClose: 3000 },
        );
        form.reset();
        setTimeout(() => {
          setIsDialogOpen(false);
        }, 500);
      }
    } catch (err) {
      const error = err as Error;
      toast.error(
        error.message ||
          t('error.unexpected', {
            defaultValue: 'An unexpected error occurred.',
          }),
        { position: 'top-right', autoClose: 5000 },
      );
    }
  };

  const handleOpenChange = (newOpenState: boolean) => {
    if (newOpenState) {
      // Opening the dialog
      if (!data || data.length === 0) {
        // Check if data is null or an empty array
        toast.error(
          t('error.noLimitDataOpen', {
            defaultValue:
              'Cannot add device: No limit types available to select from.',
          }),
          { position: 'top-right', autoClose: 5000 },
        );
        setIsDialogOpen(false);
        return;
      }
      if (emailVerified === null) {
        toast.error(
          t('error.verifyEmailOpen', {
            defaultValue: 'Please verify your email before adding a device.',
          }),
          { position: 'top-right', autoClose: 5000 },
        );
        setIsDialogOpen(false);
        return;
      }
    }
    setIsDialogOpen(newOpenState);
    if (!newOpenState) {
      form.reset(); // Reset form when dialog is closed
    }
  };

  console.log('Data:', form.watch('locationDevice'));

  return (
    <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild id={id}>
        <Button
          className={`rounded-lg text-white ${
            className || 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          {t('buttonTriggerAddDevice', {
            defaultValue: 'Add Device',
          })}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] [&>button]:hidden">
        <DialogHeader>
          <DialogTitle>
            {t('titleAddDevice', {
              defaultValue: 'Add New Monitoring Device',
            })}
          </DialogTitle>
          <DialogDescription>
            {t('descriptionAddDeviceSelect', {
              // New key for description
              defaultValue:
                'Fill in the details for your new device and select the appropriate limit type.',
            })}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="nameMonitoring"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('labelNameMonitoring', {
                      defaultValue: 'Device Name',
                    })}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="text"
                      placeholder={t('placeholderNameMonitoring', {
                        defaultValue: 'e.g., Living Room Sensor',
                      })}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* === MODIFIED Limit ID Select Field === */}
            <FormField
              control={form.control}
              name="limitId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('labelLimitType', {
                      defaultValue: 'Limit Type',
                    })}
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value} // Controlled component
                    // defaultValue is managed by form.reset in useEffect
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t(
                            'selectLimitPlaceholder', // Using the placeholder from the previous example
                            { defaultValue: 'Select a limit type' },
                          )}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {data && data.length > 0 ? (
                        data.map((limit) => (
                          <SelectItem key={limit.id} value={limit.id}>
                            {limit.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-options" disabled>
                          {t('noLimitsAvailable', {
                            // Using the key from the previous example
                            defaultValue: 'No limits available',
                          })}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* === END MODIFIED Limit ID Select Field === */}

            <FormField
              control={form.control}
              name="locationDevice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('labelLocationDevice', {
                      defaultValue: 'Device Location',
                    })}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="text"
                      placeholder={t('placeholderLocationDevice', {
                        defaultValue: 'e.g., Upstairs Bedroom',
                      })}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end mt-6 gap-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                }}
              >
                {t('limitations.form.buttonCancel', { defaultValue: 'Cancel' })}
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting
                  ? t('common.saving', { defaultValue: 'Adding...' })
                  : t('buttonAdd', {
                      defaultValue: 'Add Device',
                    })}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
