import { headers } from 'next/headers';
import { Suspense } from 'react';
import { ToastContainer } from 'react-toastify';
import { Layout } from '@/components/general/layoutMain';
import DashboardLayout from '@/modules/layoutDashboard';
import { ThemeProvider } from '@skripsi/components';
import { NotFoundContent } from '@/components/notFound';

export default async function NotFound() {
  // Get pathname on the server
  const headersList = await headers();
  const pathname =
    headersList.get('x-pathname') || headersList.get('x-invoke-path') || '/';

  // Render with appropriate layout based on pathname
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-screen">
            Loading...
          </div>
        }
      >
        {pathname === '/' ? (
          <Layout>
            <NotFoundContent />
          </Layout>
        ) : (
          <DashboardLayout>
            <NotFoundContent />
          </DashboardLayout>
        )}
      </Suspense>
      <ToastContainer />
    </ThemeProvider>
  );
}
