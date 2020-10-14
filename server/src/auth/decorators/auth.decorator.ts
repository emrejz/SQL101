import { SetMetadata } from '@nestjs/common';

export const hasRoles = (...args: string[]) => SetMetadata('roles', args);
