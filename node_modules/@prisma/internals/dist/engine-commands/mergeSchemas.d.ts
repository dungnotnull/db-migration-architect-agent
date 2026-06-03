import type { MultipleSchemas } from '@prisma/get-dmmf';
import { QueryEngineErrorInit } from './queryEngineCommons';
export type MergeSchemasOptions = {
    schemas: MultipleSchemas;
};
export declare class MergeSchemasError extends Error {
    constructor(params: QueryEngineErrorInit);
}
/**
 * Wasm'd version of `merge_schemas`.
 */
export declare function mergeSchemas(options: MergeSchemasOptions): string;
