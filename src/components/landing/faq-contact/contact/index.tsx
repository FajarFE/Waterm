'use client';

import { ActionContactForm } from '@/actions/contact-form';
import {
  contactFormSchema,
  type ContactFormSchema,
} from '@/types/contact-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@skripsi/components/ui';
import { MessageCircle, Send } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

export const ContactForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const getLocale = useLocale();
  const locale = getLocale === 'id' ? 'id' : 'en';
  const t = useTranslations('contactForm');
  const form = useForm<ContactFormSchema>({
    resolver: zodResolver(contactFormSchema(t)),
    defaultValues: {
      name: '',
      email: '',
      message: '',
      priority: '',
      topic: '',
      attachments: [] as File[],
    },
  });
  const handleSubmit = async (data: ContactFormSchema) => {
    setIsSubmitting(true);
    try {
      const result = await ActionContactForm(data, locale);
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
    } catch (error) {
      toast.error('Error');
      throw new Error(
        'An error occurred while sending the contact form: ' +
          (error as Error).message,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full lg:col-span-6">
      <Card className="h-full">
        <CardHeader className="px-3 md:px-6">
          <CardTitle className="text-base md:text-2xl flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            {t('title')}
          </CardTitle>
          <CardDescription className="text-xs md:text-base">
            {t('subtitle')}
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <CardContent className="space-y-3 px-3 md:px-6">
              <div className="space-y-1 md:space-y-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs md:text-sm" htmlFor="name">
                        {t('fields.name.label')}
                      </FormLabel>
                      <FormControl>
                        <Input
                          id="name"
                          className="text-xs md:text-sm h-8 md:h-10"
                          {...field}
                          placeholder={t('fields.name.placeholder')}
                          required
                        />
                      </FormControl>
                      <FormMessage className="text-[10px] md:text-xs" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-1 md:space-y-2">
                <FormField
                  name="email"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs md:text-sm" htmlFor="email">
                        {t('fields.email.label')}
                      </FormLabel>
                      <FormControl>
                        <Input
                          id="email"
                          type="email"
                          className="text-xs md:text-sm h-8 md:h-10"
                          placeholder={t('fields.email.placeholder')}
                          {...field}
                          required
                        />
                      </FormControl>
                      <FormMessage className="text-[10px] md:text-xs" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-1 md:space-y-2">
                <FormField
                  name="topic"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs md:text-sm" htmlFor="topic">
                        {t('fields.topic.label')}
                      </FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          required
                        >
                          <SelectTrigger
                            id="topic"
                            className="text-xs md:text-sm h-8 md:h-10"
                          >
                            <SelectValue
                              placeholder={t('fields.topic.placeholder')}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">
                              {t('fields.topic.options.general')}
                            </SelectItem>
                            <SelectItem value="iot">
                              {t('fields.topic.options.iot')}
                            </SelectItem>
                            <SelectItem value="notifications">
                              {t('fields.topic.options.notifications')}
                            </SelectItem>
                            <SelectItem value="fish">
                              {t('fields.topic.options.fish')}
                            </SelectItem>
                            <SelectItem value="billing">
                              {t('fields.topic.options.billing')}
                            </SelectItem>
                            <SelectItem value="technical">
                              {t('fields.topic.options.technical')}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage className="text-[10px] md:text-xs" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-1 md:space-y-2">
                <FormField
                  name="priority"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel
                        className="text-xs md:text-sm"
                        htmlFor="priority"
                      >
                        {t('fields.priority.label')}
                      </FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          defaultValue="medium"
                        >
                          <SelectTrigger
                            id="priority"
                            className="text-xs md:text-sm h-8 md:h-10"
                          >
                            <SelectValue
                              placeholder={t('fields.priority.placeholder')}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">
                              {t('fields.priority.options.low')}
                            </SelectItem>
                            <SelectItem value="medium">
                              {t('fields.priority.options.medium')}
                            </SelectItem>
                            <SelectItem value="high">
                              {t('fields.priority.options.high')}
                            </SelectItem>
                            <SelectItem value="urgent">
                              {t('fields.priority.options.urgent')}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage className="text-[10px] md:text-xs" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-1 md:space-y-2">
                <FormField
                  name="message"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel
                        className="text-xs md:text-sm"
                        htmlFor="message"
                      >
                        {t('fields.message.label')}
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          id="message"
                          className="text-xs md:text-sm"
                          placeholder={t('fields.message.placeholder')}
                          rows={5}
                          required
                        />
                      </FormControl>
                      <FormMessage className="text-[10px] md:text-xs" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-1 md:space-y-2">
                <FormField
                  name="attachments"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel
                        className="text-xs md:text-sm"
                        htmlFor="attachments"
                      >
                        {t('fields.attachments.label')}
                      </FormLabel>
                      <FormControl>
                        <Input
                          id="attachments"
                          type="file"
                          multiple
                          className="text-xs md:text-sm"
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            field.onChange(files);
                          }}
                        />
                      </FormControl>
                      <p className="text-[10px] md:text-xs text-muted-foreground mt-1">
                        {t('fields.attachments.description')}
                      </p>
                      <FormMessage className="text-[10px] md:text-xs" />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row justify-between gap-2 px-3 md:px-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}
                className="w-full sm:w-auto text-xs md:text-sm h-8 md:h-10"
              >
                {t('buttons.reset')}
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto text-xs md:text-sm h-8 md:h-10"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-1.5">
                    <svg
                      className="animate-spin h-3 w-3 md:h-4 md:w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    {t('buttons.sending')}
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <Send className="h-3 w-3 md:h-4 md:w-4" />
                    {t('buttons.submit')}
                  </span>
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
};
