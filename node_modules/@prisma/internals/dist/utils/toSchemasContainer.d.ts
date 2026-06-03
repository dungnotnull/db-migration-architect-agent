import type { MultipleSchemas } from '@prisma/get-dmmf';
import { SchemaContext } from '../cli/schemaContext';
import { MigrateTypes } from '../migrateTypes';
export declare function toSchemasContainer(schemas: MultipleSchemas): MigrateTypes.SchemasContainer;
export declare function toSchemasWithConfigDir(schemaContext: SchemaContext, configDir: string): MigrateTypes.SchemasWithConfigDir;
