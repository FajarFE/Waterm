'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { registerSchema, type RegisterSchema } from '../../types/signup';
import { signUp } from '../../actions/signup';
import { Stepper } from '@skripsi/components/stepper';
import { useLocale, useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

const steps = [
  { label: 'Personal', icon: <UserIcon className="w-5 h-5" /> },
  { label: 'Contact', icon: <PhoneIcon className="w-5 h-5" /> },
  { label: 'Password', icon: <LockIcon className="w-5 h-5" /> },
];

export default function RegisterPage() {
  const t = useTranslations('signUp');
  const getLocale = useLocale();
  const locale = getLocale ? 'en' : 'id';
  const [activeStep, setActiveStep] = useState(0);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const form = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema(t)),
    mode: 'onChange',
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
      if (!result.success) {
        toast.error(
          <div>
            {(Array.isArray(result.message)
              ? result.message
              : result.message.split('\n')
            ).map((msg, idx) => (
              <div key={idx}>{msg}</div> // Munculkan per baris
            ))}
          </div>,
        );
        return;
      }
      toast.success(result.message);
      redirect('/signin');
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

  const handleBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Register an account
          </h2>
        </div>
        <Stepper
          steps={steps}
          activeStep={activeStep}
          onChange={setActiveStep}
        />
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
            {activeStep === 0 && (
              <>
                <FormField
                  control={control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Your name" />
                      </FormControl>
                      <FormDescription>
                        This is your display name
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          placeholder="Your email"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
            {activeStep === 1 && (
              <>
                <FormField
                  control={control}
                  name="noWhatsapp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>WhatsApp Number</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Your WhatsApp number" />
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
                      <FormLabel>Telegram ID (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Your Telegram ID" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
            {activeStep === 2 && (
              <>
                <FormField
                  control={control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          placeholder="Your password"
                        />
                      </FormControl>
                      <FormDescription>
                        Password strength: {passwordStrength}/5
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
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          placeholder="Confirm your password"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
            <div className="flex justify-between">
              <Button
                type="button"
                onClick={handleBack}
                disabled={activeStep === 0}
              >
                Back
              </Button>
              {activeStep < steps.length - 1 ? (
                <Button type="button" onClick={handleNext}>
                  Next
                </Button>
              ) : (
                <Button type="submit">Submit</Button>
              )}
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
