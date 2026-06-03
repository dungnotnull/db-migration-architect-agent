import type { PrismaConfigWithDatasource } from '../utils/validatePrismaConfigWithDatasource';
/**
 * Get the message to display when a command is forbidden with a data proxy flag
 * @param cmd the cli command (eg. db push)
 * @returns
 */
export declare const forbiddenCmdWithDataProxyFlagMessage: (cmd: string) => string;
/**
 * Check that the data proxy cannot be used through the given urls and schema contexts
 * @param cmd the cli command (eg. db push)
 * @param validatedConfig the validated Prisma Config value
 */
export declare function checkUnsupportedDataProxy({ cmd, validatedConfig, }: {
    cmd: string;
    validatedConfig: PrismaConfigWithDatasource;
}): void;
