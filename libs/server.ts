'use server';

import { prisma } from './db';

export const getUserById = async ({ id }: { id: string }) => {
  let error = null;
  let result = null;

  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      error = 'User not found';
      return { error, result };
    }

    result = user.email;
    return { error, result };
  } catch (e) {
    error = e instanceof Error ? e.message : 'An error occurred';
    return { error, result };
  }
};
