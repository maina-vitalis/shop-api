/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Prisma } from '../../generated/prisma/client';
import { AsyncStorageService } from '../../shared/asyncLocalStorage/asynStorage.service';

export const tenantExtension = (asyncStorage: AsyncStorageService) =>
  Prisma.defineExtension({
    name: 'tenant-extension',
    query: {
      $allModels: {
        async $allOperations({ args, model, operation, query }) {
          const isolatedModels = ['Product', 'Store'];

          if (isolatedModels.includes(model)) {
            const storeId = asyncStorage.getStoreId();

            if (storeId) {
              if (model === 'Product') {
                if (
                  [
                    'findFirst',
                    'findMany',
                    'update',
                    'delete',
                    'count',
                    'aggregate',
                  ].includes(operation)
                ) {
                  args = {
                    ...args,
                    where: { ...(args as any).where, storeId },
                  };
                }

                if (operation === 'create') {
                  args = { ...args, data: { ...(args as any).data, storeId } };
                }
              }

              if (model === 'Store') {
                if (
                  ['findFirst', 'findUnique', 'update', 'delete'].includes(
                    operation,
                  )
                ) {
                  args = {
                    ...args,
                    where: { ...(args as any).where, id: storeId },
                  };
                }
              }
            }
          }

          return query(args);
        },
      },
    },
  });
