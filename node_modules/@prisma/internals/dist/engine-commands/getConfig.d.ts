import type { DataSource, GeneratorConfig } from '@prisma/generator';
import { SchemaFileInput } from '@prisma/get-dmmf';
import { QueryEngineErrorInit } from './queryEngineCommons';
export interface GetConfigResponse {
    config: ConfigMetaFormat;
    errors: GetConfigValidationError[];
}
export interface ConfigMetaFormat {
    datasources: DataSource[] | [];
    generators: GeneratorConfig[] | [];
    warnings: string[] | [];
}
interface GetConfigValidationError {
    fileName: string | null;
    message: string;
}
export type GetConfigOptions = {
    datamodel: SchemaFileInput;
};
export declare class GetConfigError extends Error {
    constructor(params: QueryEngineErrorInit);
}
/**
 * Wasm'd version of `getConfig`.
 */
export declare function getConfig(options: GetConfigOptions): Promise<ConfigMetaFormat>;
export {};
