import {
  IdTelegramSchema,
  idTelegramSchema,
  WhatappsSchema,
  whatappsSchema,
} from '@/types/notifications';
import { zodResolver } from '@hookform/resolvers/zod';
import { PopoverProps } from '@radix-ui/react-popover';
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@skripsi/components';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaUser } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { RiGridFill } from 'react-icons/ri';
export interface popoverNavbarProps extends PopoverProps {
  name: string;
  className?: string;
  email: string;
  image: string;
  noWhatsapps?: string;
  idTelegram?: string;
  isVerified: Date | null;
  id?: string;
}

export type Active =
  | 'profile'
  | 'createMonitoring'
  | 'notifications'
  | 'createLimitation'
  | 'localization'
  | null;

export const PopoverNavbar = (props: popoverNavbarProps) => {
  const t = useTranslations('dashboard');

  const [editWhatsapps, setEditWhatapps] = useState<boolean>(false);
  const [editTelegram, setEditTelegram] = useState<boolean>(false);

  const formWhatapps = useForm<WhatappsSchema>({
    resolver: zodResolver(whatappsSchema(t)),
    defaultValues: {
      whatapps: props.noWhatsapps ?? '+62',
    },
  });

  const formTelegram = useForm<IdTelegramSchema>({
    resolver: zodResolver(idTelegramSchema(t)),
    defaultValues: {
      telegram: props.noWhatsapps ?? '-',
    },
  });

  const handleSubmitWhatapps = (values: WhatappsSchema) => {
    setEditWhatapps(false);
    console.log(values);
  };

  const handleSubmitTelegram = (values: IdTelegramSchema) => {
    setEditTelegram(false);
    console.log(values);
  };

  const handleEditWhatapps = () => {
    setEditWhatapps(true);
    if (props.isVerified === null) {
      toast.error('Verifikasi email terlebih dahulu', {
        position: 'top-right',
        autoClose: 5000,
        pauseOnHover: true,
        draggable: true,
        theme: 'colored',
      });
      return;
    }
  };
  const handleEditTelegram = () => {
    setEditTelegram(true);
    if (props.isVerified === null || props.isVerified === undefined) {
      toast.info('Verifikasi email  terlebih dahulu', {
        position: 'top-right',
        autoClose: 5000,
        pauseOnHover: true,
        draggable: true,
        theme: 'colored',
      });
    }
  };

  return (
    <div className="flex flex-row md:gap-2 lg:gap-5 dark:text-white text-black justify-center items-center">
      <div className="lg:flex md:flex hidden">{props.name}</div>
      <div id="notifications-menu">
        <Popover>
          <PopoverTrigger className="cursor-pointer" asChild>
            <span id="notifications-popover">
              {props.image ? (
                <Image
                  width={50}
                  height={50}
                  className="rounded-full w-10 h-10"
                  src={props.image}
                  alt={props.name}
                />
              ) : (
                <span className="w-10 h-10 rounded-full bg-slate-100 flex justify-center items-center">
                  <FaUser />
                </span>
              )}
            </span>
          </PopoverTrigger>
          <PopoverContent
            align="center"
            className="mt-5 bg-white dark:bg-black lg:mt-5 lg:w-[200px] w-[180px] md:w-[200px]"
          >
            <div className="lg:hidden md:hidden flex">{props.name}</div>
            {editWhatsapps && props.isVerified ? (
              <Form {...formWhatapps}>
                <form
                  className="flex flex-col gap-2"
                  onSubmit={formWhatapps.handleSubmit(handleSubmitWhatapps)}
                >
                  <FormField
                    control={formWhatapps.control}
                    name="whatapps"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t('notification.fields.whatsapp.label')}
                        </FormLabel>
                        <FormControl className="flex flex-row gap-2">
                          <Input
                            placeholder={t(
                              'notification.fields.whatsapp.placeholder',
                            )}
                            {...field}
                          />
                          <Button type="submit">
                            {t('notification.updateButton')}
                          </Button>
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            ) : (
              <div className="flex flex-col ">
                <div>{t('notification.fields.whatsapp.label')}</div>
                <div className="flex justify-between items-center flex-row w-full">
                  <div>{props.noWhatsapps ? props.noWhatsapps : '+62'}</div>
                  <button
                    id="edit-whatapps"
                    className="bg-transparent py-0 text-slate-600"
                    onClick={() => {
                      handleEditWhatapps();
                    }}
                  >
                    <RiGridFill />
                  </button>
                </div>
              </div>
            )}
            {editTelegram && props.isVerified ? (
              <Form {...formTelegram}>
                <form
                  className="flex flex-col gap-2"
                  onSubmit={formTelegram.handleSubmit(handleSubmitTelegram)}
                >
                  <FormField
                    control={formTelegram.control}
                    name="telegram"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t('notification.fields.telegram.label')}
                        </FormLabel>
                        <FormControl className="flex flex-row gap-2">
                          <Input
                            placeholder={t(
                              'notification.fields.telegram.placeholder',
                            )}
                            {...field}
                          />
                          <Button type="submit">
                            {t('notification.updateButton')}
                          </Button>
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            ) : (
              <div className="flex flex-col ">
                <div> {t('notification.fields.telegram.label')}</div>
                <div className="flex flex-row w-full justify-between items-center">
                  <div>{props.idTelegram ? props.idTelegram : `-`}</div>
                  <button
                    id="edit-telegram"
                    className="bg-transparent py-0 text-slate-600"
                    onClick={() => {
                      handleEditTelegram();
                    }}
                  >
                    <RiGridFill />
                  </button>
                </div>
              </div>
            )}
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};
