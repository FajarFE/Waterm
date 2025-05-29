import type React from 'react';
import { Layout } from '@/components/general/layoutDashboard';
import { auth } from '@skripsi/libs';

export const LayoutWrapper = async ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const session = await auth();
  const id = session?.user?.id ?? '';
  const idTelegram = session?.user?.idTelegram ?? '';
  const name = session?.user?.name ?? '';
  const noWhatapps = session?.user?.noWhatsapp ?? '';
  const image = session?.user?.image ?? '';
  const isVerified = await session?.user?.emailVerified;

  return (
    <Layout
      id={id}
      isVerified={isVerified ?? null}
      email={session?.user.email ?? ''}
      idTelegram={idTelegram}
      name={name}
      noWhatsapps={noWhatapps}
      image={image}
    >
      {children}
    </Layout>
  );
};
