'use client';

import type React from 'react';

import { useCallback, useEffect, useState } from 'react';

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  Form,
  FormField,
  FormItem,
  FormControl,
  FormLabel,
  DynamicBreadcrumb,
} from '@skripsi/components';
import { toast } from 'react-toastify';
import { sendOTPEmail, verifyEmail } from '@/actions/verify-email';
import { redirect, useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { verifyEmailClientSchema } from '@/types/verify-email';
import { zodResolver } from '@hookform/resolvers/zod';
import { Clock } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

export default function VerifyEmailOTPForm() {
  const params = useSearchParams();
  const getLocale = useLocale();
  const t = useTranslations('otp');
  const locale = getLocale === 'id' ? 'id' : 'en';
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [resendCount, setResendCount] = useState(0);
  const [cooldownTime, setCooldownTime] = useState(0);
  const [isInCooldown, setIsInCooldown] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);

  const getDelayForAttempt = useCallback(() => {
    // Modified delays: starts from 30s and doubles each time, max 10 attempts
    const baseDelay = 30; // 30 seconds base delay
    const multiplier = Math.pow(2, Math.min(resendCount, 9)); // 2^n up to 2^9
    return baseDelay * multiplier; // 30, 60, 120, 240, 480, 960, 1920, 3840, 7680, 15360
  }, [resendCount]);

  useEffect(() => {
    const savedData = localStorage.getItem('resendVerifyEmail');
    const dailyData = localStorage.getItem('dailyResendLimit');

    if (dailyData) {
      const { count, date } = JSON.parse(dailyData);
      const today = new Date().toDateString();

      if (date === today) {
        setResendCount(count);
      } else {
        // Reset daily count if it's a new day
        localStorage.setItem(
          'dailyResendLimit',
          JSON.stringify({
            count: 0,
            date: today,
          }),
        );
        setResendCount(0);
      }
    }

    if (savedData) {
      const { resendCount, cooldownStart, cooldownTime } =
        JSON.parse(savedData);
      const now = Date.now();
      const elapsed = Math.floor((now - cooldownStart) / 1000);

      if (elapsed < cooldownTime) {
        const remaining = cooldownTime - elapsed;
        setResendCount(resendCount);
        setCooldownTime(cooldownTime);
        setRemainingTime(remaining);
        setIsInCooldown(true);
      } else {
        setResendCount(resendCount);
        setIsInCooldown(false);
        localStorage.removeItem('resendVerifyEmail');
      }
    }
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isInCooldown && remainingTime > 0) {
      timer = setInterval(() => {
        setRemainingTime((prev) => {
          const newTime = prev - 1;

          const savedData = localStorage.getItem('resendVerifyEmail');
          if (savedData) {
            const parsed = JSON.parse(savedData);
            parsed.remainingTime = newTime;
            localStorage.setItem('resendVerifyEmail', JSON.stringify(parsed));
          }

          if (newTime <= 0) {
            setIsInCooldown(false);
            localStorage.removeItem('resendVerifyEmail');
            return 0;
          }
          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isInCooldown, remainingTime, cooldownTime]);

  const form = useForm<verifyEmailClientSchema>({
    resolver: zodResolver(verifyEmailClientSchema(t)),
  });

  const email = params?.get('email') ?? '';
  if (email === '' || !email.toLowerCase().endsWith('@gmail.com')) {
    return redirect('/verify-email');
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  async function onSubmit(data: verifyEmailClientSchema) {
    setIsLoading(true);
    try {
      const result = await verifyEmail({ ...data, email }, locale);
      if (!result.success) {
        toast.error(result.message);
      } else {
        setVerified(true);
        toast.success(t('email.successTitle'));
        setIsLoading(false);
        const newResendCount = resendCount + 1;
        setResendCount(newResendCount);

        const delay = getDelayForAttempt();
        const now = Date.now();
        localStorage.setItem(
          'resendVerifyEmail',
          JSON.stringify({
            resendCount: newResendCount,
            cooldownStart: now,
            cooldownTime: delay,
          }),
        );

        setCooldownTime(delay);
        setRemainingTime(delay);
        setIsInCooldown(true);
      }
    } catch {
      toast.error(t('email.verifyError'));
    }
  }

  async function handleResend() {
    const dailyData = localStorage.getItem('dailyResendLimit');
    const today = new Date().toDateString();
    let dailyCount = 0;

    if (dailyData) {
      const { count, date } = JSON.parse(dailyData);
      if (date === today) {
        dailyCount = count;
      }
    }

    if (dailyCount >= 10) {
      toast.error(t('tooManyAttemptsDescription'));
      return;
    }

    if (isInCooldown) return;

    try {
      const result = await sendOTPEmail({ email }, locale);
      if (!result.success) {
        toast.error(result.message);
      } else {
        toast.success(t('resendSuccess'));

        // Update daily limit
        const newDailyCount = dailyCount + 1;
        localStorage.setItem(
          'dailyResendLimit',
          JSON.stringify({
            count: newDailyCount,
            date: today,
          }),
        );
        setResendCount(newDailyCount);

        // Set exponential cooldown
        const delay = getDelayForAttempt();
        const now = Date.now();
        localStorage.setItem(
          'resendVerifyEmail',
          JSON.stringify({
            resendCount: newDailyCount,
            cooldownStart: now,
            cooldownTime: delay,
          }),
        );

        setCooldownTime(delay);
        setRemainingTime(delay);
        setIsInCooldown(true);
      }
    } catch {
      toast.error(t('resendError'));
    }
  }

  return (
    <div className="flex flex-col gap-5 justify-center items-center md:h-[calc(100vh-57vh)] lg:h-[calc(100vh-40vh)] w-full md:px-0 md:py-5 lg:px-10 lg:py-20">
      <div className="w-full flex">
        <DynamicBreadcrumb />
      </div>
      <Card className="w-full h-full p-5 flex  justify-center items-center flex-col">
        <CardHeader className="w-full flex justify-center items-center md:h-[80%] lg:h-[50%]">
          <CardTitle className="text-2xl">{t('title')}</CardTitle>
          <CardDescription>{t('description')}</CardDescription>
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
                {t('successTitle')}
              </h3>
              <p className="text-gray-500 mb-4">{t('successDescription')}</p>
              <Button
                className="w-full"
                onClick={() => router.push('/dashboard/monitoring')}
              >
                {t('goToLogin')}
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
                    name="otp"
                    render={({ field: { onChange, value } }) => (
                      <FormItem>
                        <FormLabel>
                          <FormControl>
                            <InputOTP
                              maxLength={6}
                              value={value}
                              onChange={onChange}
                              id="otp-input"
                              className="justify-center items-center flex gap-5"
                            >
                              <InputOTPGroup className="w-full  flex justify-center items-center gap-5 ">
                                <InputOTPSlot
                                  index={0}
                                  className="rounded-md border"
                                />
                                <InputOTPSlot
                                  index={1}
                                  className="rounded-md border"
                                />
                                <InputOTPSlot
                                  index={2}
                                  className="rounded-md border"
                                />
                                <InputOTPSlot
                                  index={3}
                                  className="rounded-md border"
                                />
                                <InputOTPSlot
                                  index={4}
                                  className="rounded-md border"
                                />
                                <InputOTPSlot
                                  index={5}
                                  className="rounded-md border"
                                />
                              </InputOTPGroup>
                            </InputOTP>
                          </FormControl>
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                  <div className="mt-2 flex gap-1 flex-col">
                    <div className="flex justify-center mt-2">
                      <Button
                        type="button"
                        variant="link"
                        className="p-0 h-auto text-sm"
                        onClick={handleResend}
                        disabled={isInCooldown || form.formState.isSubmitting}
                      >
                        {isInCooldown ? (
                          <>
                            <Clock className="h-4 w-4 mr-1" />
                            {t('resendAvailableIn', {
                              countdown: formatTime(remainingTime),
                              seconds: getLocale === 'id' ? 'detik' : 'seconds',
                            })}
                            :
                          </>
                        ) : (
                          `${t('notReceived')}`
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? `${t('verifying')}` : `${t('verify')}`}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
