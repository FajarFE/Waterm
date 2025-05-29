'use server';
import { prisma } from '@skripsi/libs';
import { LimitationsForm } from './form';
import { CategoryFish } from '@prisma/client';

export const Limitation = async ({
  id,
  editLimitId,
}: {
  id?: string;
  editLimitId?: string;
}) => {
  let data;

  if (id) {
    data = await prisma.limitation.findUnique({
      where: { id },
      select: {
        name: true,
        maxPh: true,
        category: true,
        minPh: true,
        maxTemperature: true,
        minTemperature: true,
        maxTurbidity: true,
        minTurbidity: true,
        id: true,
      },
    });
  }

  return (
    <LimitationsForm
      editLimitId={editLimitId ?? ''}
      data={
        data
          ? {
              id: data.id,
              name: data.name,
              category: data.category as CategoryFish,
              maxPh: data.maxPh,
              minPh: data.minPh,
              maxTemperature: data.maxTemperature,
              minTemperature: data.minTemperature,
              maxTurbidity: data.maxTurbidity,
              minTurbidity: data.minTurbidity,
            }
          : undefined
      }
    />
  );
};
