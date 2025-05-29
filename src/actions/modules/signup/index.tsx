'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FcGoogle } from 'react-icons/fc';
import { redirect } from 'next/navigation';
import { UserIcon, PhoneIcon, LockIcon } from 'lucide-react';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Button,
} from '@skripsi/components';
import { registerSchema, type RegisterSchema } from '../../../types/signup';
import { signUp } from '@/actions/signup';
import { Stepper } from '@skripsi/components/stepper';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { toast } from 'react-toastify';
import { FaGithub } from 'react-icons/fa';
import { useLocale, useTranslations } from 'next-intl';

const steps = [
  { label: 'Personal', icon: <UserIcon className="w-5 h-5" /> },
  { label: 'Contact', icon: <PhoneIcon className="w-5 h-5" /> },
  { label: 'Password', icon: <LockIcon className="w-5 h-5" /> },
];

export default function RegisterPage() {
  const [activeStep, setActiveStep] = useState(0);
  const t = useTranslations('signUp');
  const getLocale = useLocale();
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [countdown, setCountdown] = useState(5);
  const locale = getLocale ? 'id' : 'en';
  const form = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema(t)),
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      noWhatsapp: '',
      idTelegram: '',
      password: '',
      confirmPassword: '',
    },
  });
  const { handleSubmit, watch, trigger, control } = form;
  const password = watch('password');
  useEffect(() => {
    if (password) {
      let strength = 0;
      if (password.length >= 8) strength++;
      if (/[A-Z]/.test(password)) strength++;
      if (/[a-z]/.test(password)) strength++;
      if (/[0-9]/.test(password)) strength++;
      if (/[^A-Za-z0-9]/.test(password)) strength++;
      setPasswordStrength(strength);
    } else {
      setPasswordStrength(0);
    }
  }, [password]);

  const onSubmit = async (data: RegisterSchema) => {
    try {
      const result = await signUp(data, locale);
      if (result.success) {
        toast.success(
          <div className="flex flex-col gap-2">
            <div>{t('success')}</div>
            <div>
              {t('delay')} {countdown}{' '}
              {getLocale === 'id' ? 'detik' : 'seconds'}{' '}
            </div>
          </div>,
        );
        const timer = setInterval(() => {
          setCountdown((prevCount) => {
            if (prevCount <= 1) {
              clearInterval(timer);
              redirect(`/signin?callbackUrl=/dashboard/monitoring`);
            }
            return prevCount - 1;
          });
        }, 1000);
      } else {
        toast.error(
          Array.isArray(result.message) ? (
            result.message.map((message, id) => <div key={id}>{message}</div>)
          ) : (
            <div>{result.message}</div>
          ),
        );
      }
    } catch (error: unknown) {
      toast.error(
        `An unexpected error occurred: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  };

  const handleNext = async () => {
    const fields =
      activeStep === 0
        ? (['name', 'email'] as const)
        : activeStep === 1
        ? (['noWhatsapp', 'idTelegram'] as const)
        : (['password', 'confirmPassword'] as const);
    const output = await trigger(fields);
    if (output) {
      setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
    }
  };

  return (
    <div className="h-auto flex items-center justify-center ">
      <div className="max-w-md w-full flex flex-col gap-10">
        <div>
          <h2 className="mt-6 dark:text-white   text-center text-3xl font-extrabold text-gray-900">
            {t('title')}
          </h2>
          <p>{t('description')}</p>
        </div>
        <div className="px-20 ">
          <Stepper
            steps={steps}
            activeStep={activeStep}
            onChange={setActiveStep}
          />
        </div>
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className=" space-y-10 ">
            {activeStep === 0 && (
              <div className="flex flex-col w-full gap-5">
                <FormField
                  control={control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold text-lg ">
                        {t('fields.name.label')}
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={t('fields.name.placeholder')}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold text-lg ">
                        {t('fields.email.label')}
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          placeholder={t('fields.email.placeholder')}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
            {activeStep === 1 && (
              <div className="flex flex-col w-full gap-5">
                <FormField
                  control={control}
                  name="noWhatsapp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold text-lg ">
                        {t('fields.noWhatsapp.label')}
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={t('fields.noWhatsapp.placeholder')}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="idTelegram"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold text-lg ">
                        {t('fields.idTelegram.label')}(Optional)
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={t('fields.idTelegram.placeholder')}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
            {activeStep === 2 && (
              <div className="flex flex-col w-full gap-5">
                <FormField
                  control={control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold text-lg ">
                        {t('fields.password.label')}
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          placeholder={t('fields.password.placeholder')}
                        />
                      </FormControl>
                      <FormDescription>
                        {t('fields.password.passwordStrength')}:{' '}
                        {passwordStrength}/5
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold text-lg ">
                        {t('fields.confirmPassword.label')}
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          placeholder={t('fields.confirmPassword.placeholder')}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
            <div className="flex justify-between w-full mt-5">
              {activeStep < steps.length - 1 ? (
                <Button className="w-full" type="button" onClick={handleNext}>
                  {t('button.next')}
                </Button>
              ) : (
                <Button className="w-full" type="submit">
                  {t('button.signUp')}
                </Button>
              )}
            </div>
          </form>
        </Form>
        <span className="w-full border-b-2 dark:border-white flex justify-center relative items-center">
          <span className="absolute dark:bg-black bg-white px-2 font-semibold text-lg -top-1">
            {t('orSignUp')}
          </span>
        </span>
        <div className="w-full flex justify-center items-center gap-5 flex-col">
          <div className="flex w-full flex-row gap-5 justify-between items-center">
            <Button
              className="w-full  rounded-lg hover:text-white dark:text-white  px-5 bg-transparent dark:border-white border-slate-700 border-2  flex justify-center items-center h-auto   text-black"
              onClick={() =>
                signIn('google', { callbackUrl: '/dashboard/monitoring' })
              }
            >
              <div className="flex w-full h-auto   flex-row font-semibold text-lg justify-center items-center gap-2 ">
                <FcGoogle size={30} />
                Google
              </div>
            </Button>
            <Button
              className="w-full rounded-lg hover:text-white  px-5 bg-transparent dark:border-white border-slate-700 border-2  flex justify-center items-center h-auto   text-black"
              onClick={() =>
                signIn('github', { callbackUrl: '/dashboard/monitoring' })
              }
            >
              <div className="flex w-full h-auto  flex-row font-semibold text-lg justify-center items-center gap-2 dark:text-white ">
                <FaGithub size={30} />
                Github
              </div>
            </Button>
          </div>
          <div>
            {t('haventAccount')}
            <Link className="font-semibold" href={'/signup'}>
              {t('signUp')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
