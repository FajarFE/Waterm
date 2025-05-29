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
  Progress,
  Alert,
  AlertTitle,
  AlertDescription,
} from '@skripsi/components';
import { toast } from 'react-toastify';
import {
  sendOTPForgotPassword,
  verifyOTPForgotPassword,
} from '@/actions/verify-email';
import { redirect, useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { verifyResetPasswordSignature } from '@skripsi/libs/signature';
import { AlertCircle, Clock } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import {
  verificationOTPSchema,
  VerificationOTPSchema,
} from '@/types/forget-password';

export default function VerifyFogotPasswordOTPForm() {
  const router = useRouter();
  const params = useSearchParams();
  const signature = params?.get('signature') ?? '';

  const getLocale = useLocale();
  const locale = getLocale === 'id ' ? 'id' : 'en';
  const t = useTranslations('otp');

  const [isLoading, setIsLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [resendCount, setResendCount] = useState(0);
  const [cooldownTime, setCooldownTime] = useState(0);
  const [isInCooldown, setIsInCooldown] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const [progressValue, setProgressValue] = useState(100);

  const getDelayForAttempt = useCallback((attempt: number) => {
    const delays = [30, 60, 120, 300, 600, 900, 1800];
    const index = Math.min(attempt, delays.length - 1);
    return delays[index];
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  useEffect(() => {
    const savedData = localStorage.getItem('resendOTPForgotPassword');
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
        setProgressValue((remaining / cooldownTime) * 100);
      } else {
        setResendCount(resendCount);
        setIsInCooldown(false);
        localStorage.removeItem('resendOTPForgotPassword');
      }
    }
  }, []);

  useEffect(() => {
    let timer = null;

    if (isInCooldown && remainingTime > 0) {
      timer = setInterval(() => {
        setRemainingTime((prev) => {
          const newTime = prev - 1;
          setProgressValue((newTime / cooldownTime) * 100);

          const savedData = localStorage.getItem('resendOTPForgotPassword');
          if (savedData) {
            const parsed = JSON.parse(savedData);
            parsed.remainingTime = newTime;
            localStorage.setItem(
              'resendOTPForgotPassword',
              JSON.stringify(parsed),
            );
          }

          if (newTime <= 0) {
            setIsInCooldown(false);
            localStorage.removeItem('resendOTPForgotPassword');
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

  const form = useForm<VerificationOTPSchema>({
    resolver: zodResolver(verificationOTPSchema(t)),
  });

  if (signature === '') {
    return redirect('/forgot-pasword');
  }

  async function onSubmit(data: VerificationOTPSchema) {
    setIsLoading(true);
    try {
      const result = await verifyOTPForgotPassword(
        { ...data, signature },
        locale,
      );
      if (!result.success) {
        toast.error(
          <div>
            {Array.isArray(result.message)
              ? result.message.map((msg, idx) => <div key={idx}>{msg}</div>)
              : result.message}
          </div>,
        );
      } else {
        setVerified(true);
        toast.success(t('forgotPassword.verifySuccess'));
        const timer = setInterval(() => {
          setCountdown((prevCount) => {
            if (prevCount <= 1) {
              clearInterval(timer);
              redirect(
                `/forgot-password/reset-password?signature=${signature}`,
              );
            }
            return prevCount - 1;
          });
        }, 1000);
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResend() {
    const { email } = await verifyResetPasswordSignature(signature);
    if (!email || isInCooldown) return;

    try {
      const result = await sendOTPForgotPassword({ email }, locale);
      if (!result.success) {
        toast.error(result.message);
      } else {
        toast.success(t('verificationCodeSent'));
        if (result.url && result.url !== '') {
          router.replace(result.url);
        }

        const newResendCount = resendCount + 1;
        setResendCount(newResendCount);

        const delay = getDelayForAttempt(newResendCount);
        const now = Date.now();

        localStorage.setItem(
          'resendOTPForgotPassword',
          JSON.stringify({
            resendCount: newResendCount,
            cooldownStart: now,
            cooldownTime: delay,
          }),
        );

        setCooldownTime(delay);
        setRemainingTime(delay);
        setIsInCooldown(true);
        setProgressValue(100);
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
      <Card className="w-full h-full p-5 flex dark:border-white dark:border-2  justify-center items-center flex-col">
        <CardHeader className="w-full flex justify-center items-center md:h-[80%] lg:h-[50%]">
          <CardTitle className="text-2xl">
            {t('forgotPassword.title')}
          </CardTitle>
          <CardDescription>{t('forgotPassword.description')}</CardDescription>
        </CardHeader>
        <CardContent className="lg:p-5">
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
                {t('forgotPassword.verifySuccess')}
              </h3>
              <p className="text-gray-500 mb-4">
                {t('forgotPassword.Message')}
              </p>
              <p>{countdown}</p>
            </div>
          ) : (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-2"
              >
                <div className="space-y-10">
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
                                  className="rounded-md border dark:border-white"
                                />
                                <InputOTPSlot
                                  index={1}
                                  className="rounded-md border dark:border-white"
                                />
                                <InputOTPSlot
                                  index={2}
                                  className="rounded-md border dark:border-white"
                                />
                                <InputOTPSlot
                                  index={3}
                                  className="rounded-md border dark:border-white"
                                />
                                <InputOTPSlot
                                  index={4}
                                  className="rounded-md border dark:border-white"
                                />
                                <InputOTPSlot
                                  index={5}
                                  className="rounded-md border dark:border-white"
                                />
                              </InputOTPGroup>
                            </InputOTP>
                          </FormControl>
                        </FormLabel>
                      </FormItem>
                    )}
                  />

                  <div className="space-y-1 flex gap-2  flex-col">
                    {isInCooldown && (
                      <>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {t('countdown', {
                              countdown: formatTime(remainingTime),
                            })}
                          </span>
                        </div>
                        <Progress value={progressValue} className="h-1" />
                      </>
                    )}

                    {resendCount >= 5 && (
                      <Alert variant="default" className="mt-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>{t('tooManyAttemptsTitle')}</AlertTitle>
                        <AlertDescription>
                          {t('tooManyAttemptsDescription')}
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="flex justify-center mt-2">
                      <Button
                        type="button"
                        variant="link"
                        className="p-0 h-auto text-sm"
                        onClick={handleResend}
                        disabled={isInCooldown || form.formState.isSubmitting}
                      >
                        {isInCooldown
                          ? t('pleaseWait', {
                              countdown: formatTime(remainingTime),
                            })
                          : t('notReceived')}
                      </Button>
                    </div>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? t('verifying') : t('verify', { name: 'OTP' })}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
