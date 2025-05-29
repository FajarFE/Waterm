'use client';

import type React from 'react';

import { useState } from 'react';
import { redirect, useSearchParams } from 'next/navigation';

import {
  Button,
  Input,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  DynamicBreadcrumb,
} from '@skripsi/components';

import { toast } from 'react-toastify';
import { verifyResetPasswordSignature } from '@skripsi/libs/signature';
import { useForm } from 'react-hook-form';
import {
  resetPasswordSchema,
  ResetPasswordSchema,
} from '@/types/forget-password';
import { zodResolver } from '@hookform/resolvers/zod';
import { resetPassword } from '@/actions/verify-email';
import { useLocale, useTranslations } from 'next-intl';

export default function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const t = useTranslations('resetPassword');
  const getLocale = useLocale();
  const locale = getLocale === 'id' ? 'id' : 'en';
  const [isLoading, setIsLoading] = useState(false);
  const [isReset, setIsReset] = useState(false);
  const [countdown, setCountdown] = useState<number>(5);
  const signature = searchParams?.get('signature') ?? '';
  const result = verifyResetPasswordSignature(signature);
  const { email } = result;
  const form = useForm<ResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema(t)),
  });

  const onSubmit = async (data: ResetPasswordSchema) => {
    setIsLoading(true);
    try {
      if (!email) throw new Error(t('invalidLinkError'));
      const result = await resetPassword({ ...data, email }, locale);
      if (!result.success) {
        toast.error(
          <div>
            {Array.isArray(result.message)
              ? result.message.map((msg, idx) => <div key={idx}>{msg}</div>)
              : result.message}
          </div>,
        );
        setIsReset(false);
        setIsLoading(false);
      } else {
        toast.success(result.message);
        setIsReset(true);
        setIsLoading(false);
        const timer = setInterval(() => {
          setCountdown((prevCount) => {
            if (prevCount <= 1) {
              clearInterval(timer);
              redirect('/signin');
            }
            return prevCount - 1;
          });
        }, 1000);
      }
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? error.message
          : 'An unexpected error occurred while resetting the password.',
      );
    }
  };

  return (
    <div className="flex flex-col gap-5 justify-center items-center  md:h-[calc(100vh-57vh)] lg:h-[calc(100vh-40vh)] w-full md:px-0 md:py-5 lg:px-10">
      <div className="w-full flex">
        <DynamicBreadcrumb />
      </div>
      <Card className="w-full h-full p-5 flex  justify-center items-center flex-col">
        <CardHeader className="w-full flex justify-center items-center md:h-[80%] lg:h-[50%]">
          <CardTitle className="text-2xl">{t('title')}</CardTitle>
          <CardDescription>{t('description')}</CardDescription>
        </CardHeader>
        <CardContent className="lg:p-5">
          {isReset ? (
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
                {t('successMessageTitle')}
              </h3>
              <p className="text-gray-500 mb-4">
                {t('successMessageDescription')}
              </p>
              <p className="text-gray-500 mb-4">
                {t('redirectMessage', {
                  countdown: countdown,
                })}
              </p>
              <Button
                className="w-full"
                onClick={() => (window.location.href = '/signin')}
              >
                {t('goToLoginButton')}
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
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold text-lg">
                          {t('fields.newPassword.label')}
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="password"
                            placeholder={t('fields.newPassword.placeholder')}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold text-lg">
                          {t('fields.confirmPassword.label')}
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="password"
                            placeholder={t(
                              'fields.confirmPassword.placeholder',
                            )}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? t('resettingButton') : t('submitButton')}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
