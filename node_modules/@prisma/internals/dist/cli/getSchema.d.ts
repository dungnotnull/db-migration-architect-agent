import type { GetSchemaResult } from '@prisma/schema-files-loader';
export type GetSchemaOptions = {
    schemaPath: SchemaPathInput;
    cwd?: string;
    argumentName?: string;
};
/**
 * Creates SchemaPathInput based on a combination of possible inputs
 * from CLI args, config file, or base directory.
 * `baseDir` is either the directory containing the prisma config file or the working directory
 * of the CLI invocation if no config file is found.
 */
export declare function createSchemaPathInput({ schemaPathFromArgs, schemaPathFromConfig, baseDir, }: {
    schemaPathFromArgs?: string;
    schemaPathFromConfig?: string;
    baseDir: string;
}): SchemaPathInput;
/**
 * Loads the schema, throws an error if it is not found
 */
export declare function getSchemaWithPath({ schemaPath, cwd, argumentName, }: GetSchemaOptions): Promise<GetSchemaResult>;
/**
 * The schema path can be provided as a CLI argument, a configuration file, or a base directory
 * that is expected to contain the schema in one of the default locations.
 */
export type SchemaPathInput = {
    cliProvidedPath: string;
} | {
    configProvidedPath: string;
} | {
    baseDir: string;
};
/**
 * Loads the schema, returns null if it is not found
 * Throws an error if schema is specified explicitly in
 * any of the available ways (argument, package.json config), but
 * can not be loaded
 * @param schemaPathFromArgs
 * @param schemaPathFromConfig
 * @param opts
 * @returns
 */
export declare function getSchemaWithPathOptional({ schemaPath, cwd, argumentName, }: GetSchemaOptions): Promise<GetSchemaResult | null>;
export declare function printSchemaLoadedMessage(schemaPath: string): void;
export declare function getCliProvidedSchemaFile(schemaPathFromArgs: string, cwd?: string, argumentName?: string): Promise<GetSchemaResult>;
export declare function getConfigProvidedSchemaFile(schemaPathFromConfig: string): Promise<GetSchemaResult>;
