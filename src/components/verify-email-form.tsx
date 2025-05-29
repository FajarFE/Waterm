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
  DynamicBreadcrumb,
} from '@skripsi/components';
import { toast } from 'react-toastify';
import { sendOTPEmail } from '@/actions/verify-email';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { sendOTPSchema, type SendOTPSchema } from '@/types/verify-email';
import { useLocale, useTranslations } from 'next-intl';

export default function SendVerifyEmailOTPForm() {
  const [verified, setVerified] = useState(false);
  const t = useTranslations('verifyEmail');
  const getLocale = useLocale();
  const locale = getLocale ? 'id' : 'en';
  const form = useForm<SendOTPSchema>({
    resolver: zodResolver(sendOTPSchema(t)),
    mode: 'onChange',
  });

  const [countdown, setCountdown] = useState(5);

  const onSubmit = async (data: SendOTPSchema) => {
    const result = await sendOTPEmail(data, locale);
    if (!result.success) {
      toast.error(result.message);
    } else {
      toast.success(result.message);
      setVerified(true);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev === 0) {
            clearInterval(timer);
            window.location.href = `/verify-email/otp?email=${data.email}`;
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  return (
    <div className="flex flex-col gap-5 justify-center items-center md:h-[calc(100vh-57vh)] lg:h-[calc(100vh-40vh)] w-full md:px-0 md:py-5 lg:px-10 lg:py-20">
      <div className="w-full flex">
        <DynamicBreadcrumb />
      </div>
      <Card className="w-full h-full p-5 flex dark:bg-white/40 dark:backdrop-blur-4xl   justify-center items-center flex-col  ">
        <CardHeader className="w-full flex justify-center items-center md:h-[80%] lg:h-[50%]">
          <CardTitle className="text-2xl">Verify Your Email</CardTitle>
          <CardDescription>
            Enter the verification code sent to your email
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                Email Verified Successfully
              </h3>
              <p className="text-gray-500 mb-4">
                Your email has been verified. You can now log in to your
                account.
              </p>
              <span>Akan Berpindah page dalam waktu {countdown} s</span>
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
                        <Label htmlFor="email">Email</Label>
                        <FormControl>
                          <Input {...field} placeholder="Your email" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <Button type="submit" className="w-full">
                  Send Otp
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
