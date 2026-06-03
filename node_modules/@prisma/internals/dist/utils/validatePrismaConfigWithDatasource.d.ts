import { Datasource, PrismaConfig } from '@prisma/config';
import { type RequireKey } from '../types';
export declare class ConfigValidationError extends Error {
    constructor(message: string);
}
/**
 * A Prisma Config that has been validated w.r.t. the command that is being executed.
 */
export type PrismaConfigWithDatasource = RequireKey<PrismaConfig, 'datasource'> & {
    datasource: RequireKey<Datasource, 'url'>;
};
type ValidatePrismaConfigWithDatasourceInput = {
    config: Pick<PrismaConfig, 'datasource'>;
    cmd: string;
};
export declare function validatePrismaConfigWithDatasource({ config, cmd, }: ValidatePrismaConfigWithDatasourceInput): PrismaConfigWithDatasource;
export {};
