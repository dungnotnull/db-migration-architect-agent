import type { PrismaConfig } from '@prisma/config';
import { SchemaContext } from './schemaContext';
export type DirectoryConfig = {
    viewsDirPath: string;
    typedSqlDirPath: string;
    migrationsDirPath: string;
};
/**
 * TODO: `config` should very likely be mandatory here.
 */
export declare function inferDirectoryConfig(schemaContext?: SchemaContext | null, config?: Pick<PrismaConfig, 'views' | 'typedSql' | 'migrations'>, cwd?: string): DirectoryConfig;
