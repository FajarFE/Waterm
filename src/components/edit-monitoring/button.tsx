'use client';
import { Limitation } from '@prisma/client';
import { TbEdit } from 'react-icons/tb';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@skripsi/components';
import { toast } from 'react-toastify';

export const ButtonEdit = ({
  data,
  emailVerified,
  isDialogOpen,
  setIsDialogOpen,
  children,
  idElement,
  className,
}: {
  dataLimit?: Limitation | null;
  data?: {
    limitId: string;
    nameMonitoring: string;
    locationDevices: string;
  } | null;
  emailVerified?: Date | null;
  isDialogOpen?: boolean;
  setIsDialogOpen?: (open: boolean) => void;
  children?: React.ReactNode;
  className?: string;
  idElement: string;
}) => {
  return (
    <Dialog
      open={isDialogOpen}
      onOpenChange={(newOpen) => {
        if (!data || !data === null) {
          toast.error('No limitation data available', {
            position: 'top-right',
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
          setIsDialogOpen?.(false);
          throw new Error('No limitation data available');
        } else if (emailVerified === null) {
          toast.error('Please verify your email first', {
            position: 'top-right',
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
          setIsDialogOpen?.(false);
          throw new Error('Please verify your email first');
        } else if (isDialogOpen && !newOpen) {
          return;
        } else {
          setIsDialogOpen?.(newOpen);
        }
      }}
    >
      <DialogTrigger id={idElement}>
        <div className={` rounded-lg  ${className}`}>
          <TbEdit size={25} />
        </div>
      </DialogTrigger>
      <DialogContent className="[&>button]:hidden">
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
};
