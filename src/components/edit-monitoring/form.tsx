import { monitoringSchema, MonitoringSchema } from '@/types/monitoring';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  // Add these Select components
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@skripsi/components';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';

export const FormEditMonitoring = ({
  dataLimit,
  data,
  emailVerified,
  setIsDialogOpen,
}: {
  dataLimit: {
    id: string;
    name: string;
  }[];
  data?: {
    id: string;
    limitId: string;
    nameMonitoring: string;
    locationDevices: string;
  } | null;
  emailVerified?: Date | null;
  isDialogOpen?: boolean;
  setIsDialogOpen?: (open: boolean) => void;
}) => {
  const t = useTranslations('dashboard');
  const form = useForm<MonitoringSchema>({
    defaultValues: {
      nameMonitoring: data?.nameMonitoring ?? '',
      limitId: data?.limitId ?? '', // This will be the default selected value
      locationDevice: data?.locationDevices ?? '',
    },
    resolver: zodResolver(monitoringSchema(t)),
  });

  const handleSubmit = async (value: MonitoringSchema) => {
    try {
      if (!dataLimit || dataLimit.length === 0) {
        // Also check if dataLimit has items
        throw new Error('No limitation data available to select from.');
      }
      if (!emailVerified) {
        throw new Error('Please verify your email first');
      }
      console.log('Form values:', value);
      // Call the createMonitoring/updateMonitoring function with the form values
      //   if (data) {
      //     // Update logic
      //     // await updateMonitoring({ id: data.id, ...value });
      //   } else {
      //     // Create logic
      //     // await createMonitoring({
      //     //   ...value,
      //     //   userId: emailVerified, // Assuming userId comes from emailVerified or similar
      //     // });
      //   }
      setIsDialogOpen?.(false); // Close dialog on successful submission
    } catch (error) {
      // It's generally better to show errors in the UI (e.g., using react-toastify or a FormError component)
      // rather than throwing them and potentially crashing the component or app part.
      // For now, logging to console or re-throwing as per original.
      console.error(
        'An error occurred while processing the monitoring data: ',
        error,
      );
      // You might want to set a form error here:
      // form.setError('root', { message: (error as Error).message });
      // Or re-throw if that's the desired pattern in your app.
      // throw new Error(
      //   'An error occurred while creating/editing the monitoring data: ' +
      //     (error as Error).message,
      // );
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="nameMonitoring"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name Monitoring</FormLabel>
              <FormControl>
                <Input {...field} type="text" placeholder="Name Monitoring" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Modified limitId field to be a Select dropdown */}
        <FormField
          control={form.control}
          name="limitId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Limit Type</FormLabel> {/* Changed label slightly */}
              <Select
                onValueChange={field.onChange}
                value={field.value}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t('monitoring.form.selectLimitPlaceholder', {
                        defaultValue: 'Select a limit type',
                      })}
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {dataLimit &&
                    dataLimit.length > 0 &&
                    dataLimit.map((limit) => (
                      <SelectItem key={limit.id} value={limit.id}>
                        {limit.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="locationDevice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location Devices</FormLabel>
              <FormControl>
                <Input {...field} type="text" placeholder="Location Devices" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Optional: Display root form errors */}
        {form.formState.errors.root && (
          <FormMessage className="text-red-500">
            {form.formState.errors.root.message}
          </FormMessage>
        )}

        <div className="flex justify-end mt-4 gap-2">
          <Button
            type="button"
            variant="outline" // Using variant for styling consistency
            onClick={() => {
              setIsDialogOpen?.(false);
              form.reset();
            }}
          >
            {t('limitations.form.buttonCancel')}
          </Button>
          <Button
            type="submit"
            // className="bg-purple-500 py-2 px-4 rounded-lg text-white" // Using default Button styling
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting
              ? t('common.saving', { defaultValue: 'Saving...' })
              : data
              ? t('limitations.form.edit.buttonEdit')
              : t('limitations.form.create.buttonCreate')}
          </Button>
        </div>
      </form>
    </Form>
  );
};
