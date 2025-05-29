import type React from 'react';
import { Layout } from '../../../src/components/general/layoutMain';
import { ThemeProvider } from 'next-themes';
import '../globals.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import stylesheet
import { TourProvider } from '@skripsi/hooks/tour-guide';
import { TourGuide } from '@skripsi/components/TourGuide/tour-guide';
import { TourResumeBanner } from '@skripsi/components/TourGuide/tour-resume-banner';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <TourProvider>
        <Layout>{children}</Layout>
        <TourGuide />
        <TourResumeBanner />
      </TourProvider>
      <ToastContainer />
    </ThemeProvider>
  );
}
