'use client';

import { deleteMonitoring } from '@/actions/monitoring';
import { sessionUser } from '@/types/session';
import { useLocale } from 'next-intl';
import { FaTrashAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';

type Props = {
  id: string;
  session: sessionUser; // bisa ketatkan lagi tipe ini kalau mau
  size?: number;
  deleteDeviceId?: string;
};

export const ButtonDeleteDevice = ({
  id,
  session,
  size,
  deleteDeviceId,
}: Props) => {
  const getLocale = useLocale();
  const locale: 'id' | 'en' = getLocale === 'id' ? 'id' : 'en';
  const handleDelete = async () => {
    confirmAlert({
      title: locale === 'id' ? 'Konfirmasi Hapus' : 'Delete Confirmation',
      message:
        locale === 'id'
          ? 'Apakah anda yakin ingin menghapus perangkat ini?'
          : 'Are you sure you want to delete this device?',
      buttons: [
        {
          label: locale === 'id' ? 'Ya' : 'Yes',
          onClick: async () => {
            try {
              if (!session) {
                toast.error('Session not found');
                return;
              }
              if (session.user.emailVerified === null) {
                toast.error('Email not verified');
                return;
              }
              const result = await deleteMonitoring(
                id,
                session.user.id,
                locale,
              );
              if (result.code === 200) {
                toast.success(result.message);
              } else {
                toast.error(result.message);
              }
            } catch (error) {
              toast.error(
                error instanceof Error
                  ? error.message
                  : 'Internal server error',
              );
            }
          },
        },
        {
          label: locale === 'id' ? 'Tidak' : 'No',
          onClick: () => {},
        },
      ],
    });
  };

  return (
    <button id={deleteDeviceId} onClick={handleDelete}>
      <FaTrashAlt size={size} />
    </button>
  );
};
