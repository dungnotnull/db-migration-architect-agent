import { ActiveConnectorType, DataSource, GeneratorConfig } from '@prisma/generator';
import { GetSchemaResult, LoadedFile } from '@prisma/schema-files-loader';
import { SchemaPathInput } from './getSchema';
export type SchemaContext = {
    /**
     * All loaded schema files and their paths.
     */
    schemaFiles: LoadedFile[];
    /**
     * The root directory of the schema files.
     * Either set explicitly from a schema folder based config or the parent directory of the schema.prisma file.
     */
    schemaRootDir: string;
    /**
     * The path that shall be printed in user facing logs messages informing them from where the schema was loaded.
     */
    loadedFromPathForLogMessages: string;
    /**
     * The datasource extracted from the Prisma schema. So far we only support a single datasource block.
     */
    primaryDatasource: DataSource | undefined;
    /**
     * Warnings that were raised during Prisma schema parsing.
     */
    warnings: string[] | [];
    /**
     * The datasources extracted from the Prisma schema. Prefer to use primaryDatasource for most cases.
     */
    datasources: DataSource[] | [];
    /**
     * The generators extracted from the Prisma schema.
     */
    generators: GeneratorConfig[] | [];
    /**
     * @deprecated Only used during the refactoring for backwards compatibility. Use `schemaFiles` instead or determine needed file paths otherwise.
     */
    schemaPath: string;
};
type LoadSchemaContextOptions = {
    schemaPath: SchemaPathInput;
    printLoadMessage?: boolean;
    allowNull?: boolean;
    schemaPathArgumentName?: string;
    cwd?: string;
};
export declare function loadSchemaContext(opts: LoadSchemaContextOptions & {
    allowNull: true;
}): Promise<SchemaContext | null>;
export declare function loadSchemaContext(opts?: LoadSchemaContextOptions): Promise<SchemaContext>;
export declare function processSchemaResult({ schemaResult, printLoadMessage, cwd, }: {
    schemaResult: GetSchemaResult;
    printLoadMessage?: boolean;
    cwd?: string;
}): Promise<SchemaContext>;
export declare function getSchemaDatasourceProvider(schemaContext: SchemaContext): ActiveConnectorType;
export {};
