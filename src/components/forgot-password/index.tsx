'use client';

import type React from 'react';

import { useState } from 'react';

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Label,
  Input,
  FormField,
  FormItem,
  FormControl,
  Form,
  FormMessage,
  DynamicBreadcrumb,
} from '@skripsi/components';
import { toast } from 'react-toastify';
import { sendOTPForgotPassword } from '@/actions/verify-email';
import { redirect, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { sendOTPSchema, SendOTPSchema } from '@/types/verify-email';
import { SendOTPForgotPasswordSchema } from '@/types/forget-password';
import { useLocale, useTranslations } from 'next-intl';

export default function ForgotPasswordForm() {
  const getLocale = useLocale();
  const locale = getLocale === ' id' ? 'id' : 'en';
  const t = useTranslations('forgotPassword');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [verified, setVerified] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(5);
  const [url, setUrl] = useState<string>('');
  const form = useForm<SendOTPForgotPasswordSchema>({
    resolver: zodResolver(sendOTPSchema(t)),
    mode: 'onChange',
  });
  const router = useRouter();
  const onSubmit = async (data: SendOTPSchema) => {
    setIsLoading(true);
    const result = await sendOTPForgotPassword(data, locale);
    if (!result.success) {
      toast.error(result.message);
    } else {
      toast.success(t('countdown', { countdown: countdown }));
      setUrl(result.url as string);
      console.log(result.url);
      setVerified(true);
      if (result.url) {
        const timer = setInterval(() => {
          setCountdown((prevCount) => {
            if (prevCount <= 1) {
              clearInterval(timer);
              redirect(result.url as string);
            }
            return prevCount - 1;
          });
        }, 1000);
      }
    }
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col gap-5 justify-center items-center  md:h-[calc(100vh-57vh)] w-full md:px-0 md:py-5 lg:px-10 ">
      <div className="w-full flex">
        <DynamicBreadcrumb />
      </div>
      <Card className="w-full h-full p-5 flex  justify-center items-center flex-col">
        <CardHeader className="w-full flex justify-center items-center md:h-[80%] lg:h-[50%]">
          <CardTitle className="text-2xl">{t('title')}</CardTitle>
          <CardDescription>{t('description')}</CardDescription>
        </CardHeader>
        <CardContent className="w-full h-full">
          {verified ? (
            <div className="text-center py-4">
              <div className="mb-4 text-green-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="64"
                  height="64"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mx-auto"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {t('successTitle')}
              </h3>
              <p className="text-gray-500 mb-4">{t('successMessage')}</p>
              <Button className="w-full" onClick={() => router.push(url)}>
                {t('goToOTP')}
              </Button>
            </div>
          ) : (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <Label htmlFor="email">{t('fields.email.label')}</Label>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder={t('fields.email.placeholder')}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button type="submit" className="w-full">
                  {isLoading ? t('processing') : t('submitButton')}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
