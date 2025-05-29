import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  TabsTrigger,
  Tabs,
  TabsList,
  TabsContent,
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  CardFooter,
} from '@skripsi/components';
import { Bell, BookOpen, Code, Fish, Globe } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

interface Questions {
  question: string;
  answer: string;
}
// Static categories and icons mapping for consistent rendering
const categories = [
  {
    value: 'general',
    label: 'categories.general',
    icon: <Globe className="h-4 w-4" />,
  },
  { value: 'iot', label: 'categories.iot', icon: <Code className="h-4 w-4" /> },
  {
    value: 'tutorials',
    label: 'categories.tutorials',
    icon: <BookOpen className="h-4 w-4" />,
  },
  {
    value: 'notifications',
    label: 'categories.notifications',
    icon: <Bell className="h-4 w-4" />,
  },
  {
    value: 'monitoring',
    label: 'categories.monitoring',
    icon: <Fish className="h-4 w-4" />,
  },
];

export const FAQComponents = () => {
  const t = useTranslations('faq');
  const [activeTab, setActiveTab] = useState('general');

  // FAQ data map (bisa dari API atau file lokal tergantung implementasi akhir)
  const faqData = t.raw('questions'); // Mengambil object asli, bukan string (hanya jika next-intl v3+)

  return (
    <div className="w-full lg:col-span-6">
      <Card className="h-auto">
        <CardHeader className="px-3 md:px-6">
          <CardTitle>
            <h2 className="text-base md:text-2xl">{t('title')}</h2>
          </CardTitle>
          <CardDescription className="text-xs md:text-base">
            {t('subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-2 md:px-6">
          <Tabs
            defaultValue="general"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <div className="relative w-full">
              <div className="overflow-x-auto no-scrollbar">
                <TabsList className="h-8 md:h-10 w-max min-w-full md:w-full flex justify-start md:justify-center">
                  {categories.map(({ value, label, icon }) => (
                    <TabsTrigger
                      key={value}
                      value={value}
                      className="flex items-center gap-1 px-2 md:px-4 py-1 text-[10px] md:text-sm"
                    >
                      {icon}
                      <span className="hidden sm:inline">{t(label)}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
              <div className="absolute right-0 top-0 h-8 md:h-10 w-8 bg-gradient-to-l from-background to-transparent md:hidden" />
            </div>

            {categories.map(({ value }) => (
              <TabsContent key={value} value={value} className="mt-2 md:mt-4">
                <Accordion type="single" collapsible className="w-full">
                  {faqData[value]?.map((item: Questions, index: number) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger>
                        <h3 className="text-xs md:text-base py-2 w-full flex justify-between">
                          {item.question}
                        </h3>
                      </AccordionTrigger>
                      <AccordionContent className="text-xs md:text-sm">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  )) || (
                    <p className="text-xs md:text-sm text-muted-foreground">
                      {t('notFound')}
                    </p>
                  )}
                </Accordion>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-center border-t pt-2 md:pt-6">
          <p className="text-[10px] md:text-xs text-muted-foreground">
            {t('notFound')}
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};
