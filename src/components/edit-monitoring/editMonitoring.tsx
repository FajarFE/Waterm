'use client';
import { useState } from 'react';
import { ButtonEdit } from './button';
import { FormEditMonitoring } from './form';

export const EditMonitoring = ({
  dataLimit,
  data,
  emailVerified,
  editId,
}: {
  dataLimit: {
    id: string;
    name: string;
  }[];
  data?: {
    id: string;
    limitId: string;
    nameMonitoring: string;
    locationDevices: string;
  } | null;
  emailVerified?: Date | null;
  editId: string;
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  return (
    <ButtonEdit
      idElement={editId}
      emailVerified={emailVerified}
      data={data}
      setIsDialogOpen={setIsDialogOpen}
      isDialogOpen={isDialogOpen}
    >
      <FormEditMonitoring
        dataLimit={dataLimit}
        data={data}
        setIsDialogOpen={setIsDialogOpen}
      />
    </ButtonEdit>
  );
};
