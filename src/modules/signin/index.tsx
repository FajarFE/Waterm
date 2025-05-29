'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FcGoogle } from 'react-icons/fc';
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Checkbox,
} from '@skripsi/components';
import { toast } from 'react-toastify';
import { FaGithub } from 'react-icons/fa';
import { signInSchema, SignInSchema } from '@/types/signin';
import { useLocale, useTranslations } from 'next-intl';

export default function LoginPage() {
  const locale = useLocale();
  const t = useTranslations('signIn');
  const router = useRouter();
  const form = useForm<SignInSchema>({
    resolver: zodResolver(signInSchema(t)),
    defaultValues: {
      rememberMe: false,
      email: '',
      password: '',
    },
  });

  const { handleSubmit, control } = form;

  const onSubmit = async (data: SignInSchema) => {
    try {
      const result = await signIn('credentials', {
        redirectTo: '/dashboard/monitoring',
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe,
        locale: locale,
        redirect: false,
      });

      if (result?.error) {
        toast.error(t('errorAccount'));
      } else {
        router.push('/dashboard/monitoring'); // Redirect to dashboard on successful login
      }
    } catch (error: unknown) {
      console.error('Sign-in error:', error);
      toast.error('An error occurred during sign in');
    }
  };

  return (
    <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full flex gap-5 flex-col space-y-8">
        <div>
          <h2 className="mt-6 dark:text-white text-center text-3xl font-extrabold text-gray-900">
            {t('title')}
          </h2>
          <p>{t('description')}</p>
        </div>
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
            <div className="flex flex-col w-full gap-5">
              <FormField
                control={control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold text-lg">
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
              <FormField
                control={control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold text-lg">
                      {t('fields.password.label')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        placeholder={t('fields.password.placeholder')}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-row justify-between items-center">
                <FormField
                  control={control}
                  name="rememberMe"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 gap-4 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>{t('rememberMe')}</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                <Link className="text-sm" href={'/forgot-password'}>
                  {t('forgotPassword')}
                </Link>
              </div>

              <Button type="submit" className="w-full">
                {t('button')}
              </Button>
            </div>
          </form>
        </Form>

        <span className="w-full border-b-2  dark:border-white flex justify-center relative items-center">
          <span className="absolute dark:bg-black bg-white px-2 font-semibold text-lg -top-1">
            {t('orSignIn')}
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
