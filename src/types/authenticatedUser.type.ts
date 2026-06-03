import { Prisma } from '../generated/prisma/client';

export const authUserSelect = {
  select: {
    id: true,
    name: true,
    email: true,
    vendorProfile: {
      select: {
        id: true,
        store: {
          select: {
            id: true,
          },
        },
      },
    },
  },
} satisfies Prisma.UserDefaultArgs;

export type AuthenticatedUser = Prisma.UserGetPayload<{
  select: typeof authUserSelect.select;
}>;
