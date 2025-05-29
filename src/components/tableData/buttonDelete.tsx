// components/button-delete.tsx
'use client';

import { DeleteLimitations } from '@/actions/limitations';
import { Button } from '@skripsi/components';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { confirmAlert } from 'react-confirm-alert';

export const ButtonDelete = ({
  id,
  userId,
  locale,
  deleteId,
  emailVerified,
}: {
  id: string;
  userId: string;
  locale: 'id' | 'en';
  deleteId: string;
  emailVerified: Date | null;
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (isDeleting) return;
    if (!emailVerified) {
      toast.error('Please verify your email first');
      return;
    }

    confirmAlert({
      title: locale === 'id' ? 'Konfirmasi Hapus' : 'Delete Confirmation',
      message:
        locale === 'id'
          ? 'Apakah anda yakin ingin menghapus batasan ini?'
          : 'Are you sure you want to delete this limitation?',
      buttons: [
        {
          label: locale === 'id' ? 'Ya' : 'Yes',
          onClick: async () => {
            try {
              setIsDeleting(true);
              const result = await DeleteLimitations({ id }, locale, userId);
              if (result.code === 200) {
                toast.success(result.message);
              } else {
                toast.error(result.message);
              }
            } catch (error) {
              if (error instanceof Error) {
                toast.error(error.message);
              } else {
                toast.error('Internal server error');
              }
            } finally {
              setIsDeleting(false);
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
    <Button id={deleteId} onClick={handleDelete} disabled={isDeleting}>
      Delete
    </Button>
  );
};
