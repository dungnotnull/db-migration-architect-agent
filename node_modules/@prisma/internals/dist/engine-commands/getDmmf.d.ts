import type * as DMMF from '@prisma/dmmf';
import type { DataSource, GeneratorConfig } from '@prisma/generator';
import { type SchemaFileInput } from '@prisma/get-dmmf';
import { QueryEngineErrorInit } from './queryEngineCommons';
export { externalToInternalDmmf } from '@prisma/get-dmmf';
export interface ConfigMetaFormat {
    datasources: DataSource[];
    generators: GeneratorConfig[];
    warnings: string[];
}
export type GetDMMFOptions = {
    datamodel: SchemaFileInput;
};
export declare class GetDmmfError extends Error {
    constructor(params: QueryEngineErrorInit);
}
/**
 * Wasm'd version of `getDMMF`.
 */
export declare function getDMMF(options: GetDMMFOptions): Promise<DMMF.Document>;
export declare function getInternalDMMF(options: GetDMMFOptions): Promise<DMMF.Document>;
