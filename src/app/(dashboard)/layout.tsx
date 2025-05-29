import { ThemeProvider } from '@skripsi/components';

import DashboardLayout from '@/modules/layoutDashboard';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { TourGuide } from '@skripsi/components/TourGuide/tour-guide';
import { TourProvider } from '@skripsi/hooks/tour-guide';
import { TourResumeBanner } from '@skripsi/components/TourGuide/tour-resume-banner';

export default function Dashboard({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <TourProvider>
        <DashboardLayout>{children}</DashboardLayout>
        <TourGuide />
        <TourResumeBanner />
      </TourProvider>
      <ToastContainer />
    </ThemeProvider>
  );
}
