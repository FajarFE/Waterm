'use client';

import { createOrUpdateLimitation } from '@/actions/limitations';
import { limitationSchema, type LimitationsSchema } from '@/types/limit';
import { zodResolver } from '@hookform/resolvers/zod';
import { CategoryFish } from '@prisma/client';
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
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@skripsi/components';
import { useSession } from 'next-auth/react';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

interface data {
  id: string;
  name: string;
  category: CategoryFish;
  maxPh: number;
  minPh: number;
  maxTemperature: number;
  minTemperature: number;
  maxTurbidity: number;
  minTurbidity: number;
}

export const LimitationsForm = ({
  data,
  editLimitId,
}: {
  data?: data;
  editLimitId: string;
}) => {
  const session = useSession();
  const [open, setOpen] = useState(false);
  const t = useTranslations('dashboard');
  const getLocale = useLocale();
  const locale = getLocale === 'id' ? 'id' : 'en';
  const defaultValues = {
    name: data?.name ?? '',
    category: data?.category ?? CategoryFish.Lele,
    maxPh: data?.maxPh ?? '',
    minPh: data?.minPh ?? '',
    maxTemperature: data?.maxTemperature ?? '',
    minTemperature: data?.minTemperature ?? '',
    maxTurbidity: data?.maxTurbidity ?? '',
    minTurbidity: data?.minTurbidity ?? '',
  };

  const form = useForm<LimitationsSchema>({
    defaultValues: defaultValues as LimitationsSchema,
    resolver: zodResolver(limitationSchema(t)),
  });

  const handleSubmit = async (value: LimitationsSchema) => {
    try {
      // Check form validity before submission
      const isValid = await form.trigger();
      if (!isValid) {
        // If form is invalid, don't proceed with submission
        return;
      }

      const result = await createOrUpdateLimitation({
        data: value,
        userId: session.data?.user.id as string,
        locale,
        limitationId: data?.id,
      });

      if (!result.success) {
        toast.error(result.message, {
          position: 'top-right',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      } else {
        toast.success(result.message);
        setOpen(false);
        form.reset();
      }
    } catch (err) {
      const error = err as Error;

      toast.error(error.message, {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        if (open && !newOpen) {
          // Don't close the dialog when clicking outside
          return;
        }
        setOpen(newOpen);
      }}
    >
      <DialogTrigger id={editLimitId} asChild onClick={() => setOpen(true)}>
        <Button>
          {data
            ? t('limitations.form.edit.buttonEdit')
            : t('limitations.form.create.buttonCreate')}
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full max-w-2xl flex flex-col [&>button]:hidden">
        <DialogHeader className="flex flex-col w-full">
          <DialogTitle>
            {data
              ? t('limitations.form.edit.title')
              : t('limitations.form.create.title')}
          </DialogTitle>
          <DialogDescription>
            {data
              ? t('limitations.form.edit.description')
              : t('limitations.form.create.description')}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex flex-col gap-5"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('limitations.fields.name.label')}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={t('limitations.fields.name.placeholder')}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('limitations.fields.name.label')}</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t('limitations.fields.name.placeholder')}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {Object.values(CategoryFish).map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-5">
              <FormField
                control={form.control}
                name="minPh"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('limitations.fields.minPh.label')}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        placeholder={t('limitations.fields.minPh.placeholder')}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="maxPh"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('limitations.fields.maxPh.label')}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        placeholder={t('limitations.fields.maxPh.placeholder')}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-5">
              <FormField
                control={form.control}
                name="minTemperature"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('limitations.fields.minTemperature.label')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        placeholder={t(
                          'limitations.fields.minTemperature.placeholder',
                        )}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="maxTemperature"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('limitations.fields.maxTemperature.label')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        placeholder={t(
                          'limitations.fields.maxTemperature.placeholder',
                        )}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-5">
              <FormField
                control={form.control}
                name="minTurbidity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('limitations.fields.minTurbidity.label')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        placeholder={t(
                          'limitations.fields.minTurbidity.placeholder',
                        )}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="maxTurbidity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('limitations.fields.maxTurbidity.label')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        placeholder={t(
                          'limitations.fields.maxTurbidity.placeholder',
                        )}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-end mt-4 gap-2">
              <Button
                type="button"
                className="bg-purple-500 py-2 px-4 rounded-lg text-white"
                onClick={() => {
                  setOpen(false);
                  form.reset();
                }}
              >
                {t('limitations.form.buttonCancel')}
              </Button>
              <Button
                type="submit"
                className="bg-purple-500 py-2 px-4 rounded-lg text-white"
              >
                {data
                  ? t('limitations.form.edit.buttonEdit')
                  : t('limitations.form.create.buttonCreate')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
