import { SchemaPathInput } from './getSchema';
/**
 * Get a unique identifier for the project by hashing
 * the directory with `schema.prisma`
 */
export declare function getProjectHash(schemaPath: SchemaPathInput): Promise<string>;
/**
 * Get a unique identifier for the CLI installation path
 * which can be either global or local (in project's node_modules)
 */
export declare function getCLIPathHash(): string;
