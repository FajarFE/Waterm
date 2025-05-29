import { NextIntlClientProvider } from 'next-intl';
import './globals.css';
import { getLocale, getMessages } from 'next-intl/server';
import { SessionProvider } from 'next-auth/react';
import 'react-confirm-alert/src/react-confirm-alert.css';

import localFont from 'next/font/local';
import { SocketProvider } from '@/contexts/SocketContext';

export const metadata = {
  title: 'Water Meter IoT',
  description: 'App for monitoring water meter IoT',
  icons: {
    icon: '/logo.png',
  },
};

export const Poppins = localFont({
  src: '../../public/font/Poppins-Regular.ttf',
  variable: '--font-raleway',
  display: 'swap',
});

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const messages = await getMessages();
  const locale = await getLocale();
  return (
    <html className={`${Poppins.variable}`} lang="en" suppressHydrationWarning>
      <head>
        <title>Waterm - Water Quality Monitoring System</title>
        <meta
          name="description"
          content="Real-time water quality monitoring system for aquaculture"
        />
      </head>
      <body className="lg:max-w-[1700px] overflow-x-hidden h-auto mx-auto font-raleway">
        <SocketProvider
          enableDatabaseSaving={true}
          saveInterval={100000} // Save every 5 seconds
        >
          <NextIntlClientProvider locale={locale} messages={messages}>
            <SessionProvider>{children}</SessionProvider>
          </NextIntlClientProvider>
        </SocketProvider>
      </body>
    </html>
  );
}
