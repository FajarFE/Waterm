import { ContactForm } from '@/components/landing/faq-contact/contact';
import { FAQComponents } from '@/components/landing/faq-contact/faq-component';
import { useTranslations } from 'next-intl';

export const ContactFAQSection = () => {
  const t = useTranslations('common');
  return (
    <div className="container h-full mx-auto flex flex-col gap-6 md:gap-10 px-4 md:px-6">
      <div className="flex justify-between items-center">
        <div className="text-center flex-1">
          <h1 className="text-2xl md:text-3xl font-bold dark:text-white tracking-tight mb-2">
            {t('title')}
          </h1>
          <p className="text-sm md:text-base text-muted-foreground dark:text-white max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-8">
        <ContactForm />
        <FAQComponents />
      </div>
    </div>
  );
};
