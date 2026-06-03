import type * as DMMF from '@prisma/dmmf';

/**
 * Turns type: string into type: string[] for all args in order to support union input types
 * @param document
 */
export declare function externalToInternalDmmf(document: DMMF.Document): DMMF.Document;

/**
 * Wasm'd version of `getDMMF`.
 */
export declare function getDMMF(options: GetDMMFOptions): DMMF.Document | GetDMMFError;

export declare type GetDMMFError = {
    type: 'wasm-error' | 'parse-json';
    reason: string;
    error: Error;
};

export declare type GetDMMFOptions = {
    datamodel: SchemaFileInput;
};

export declare function getInternalDMMF(options: GetDMMFOptions): DMMF.Document | GetDMMFError;

export declare type MultipleSchemas = Array<MultipleSchemaTuple>;

export declare type MultipleSchemaTuple = [filename: string, content: string];

export declare type SchemaFileInput = SingleSchema | MultipleSchemas;

export declare type SingleSchema = string;

/**
 * Converts the first character of a word to lower case.
 */
export declare function uncapitalize<T extends string>(self: T): Uncapitalize<T>;

export { }
