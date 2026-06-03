import type * as DMMF from '@prisma/dmmf';
import { SqlQueryOutput } from './typedSql';
export interface GeneratorConfig {
    name: string;
    output: EnvValue | null;
    isCustomOutput?: boolean;
    provider: EnvValue;
    config: {
        /** `output` is a reserved name and will only be available directly at `generator.output` */
        output?: never;
        /** `provider` is a reserved name and will only be available directly at `generator.provider` */
        provider?: never;
        /** `binaryTargets` is a reserved name and will only be available directly at `generator.binaryTargets` */
        binaryTargets?: never;
        /** `previewFeatures` is a reserved name and will only be available directly at `generator.previewFeatures` */
        previewFeatures?: never;
    } & {
        [key: string]: string | string[] | undefined;
    };
    binaryTargets: BinaryTargetsEnvValue[];
    previewFeatures: string[];
    sourceFilePath: string;
}
export interface EnvValue {
    fromEnvVar: null | string;
    value: null | string;
}
export interface BinaryTargetsEnvValue {
    fromEnvVar: string | null;
    value: string;
    native?: boolean;
}
export type ConnectorType = 'mysql' | 'mongodb' | 'sqlite' | 'postgresql' | 'postgres' | 'prisma+postgres' | 'sqlserver' | 'cockroachdb';
export type ActiveConnectorType = Exclude<ConnectorType, 'postgres' | 'prisma+postgres'>;
export interface DataSource {
    name: string;
    provider: ConnectorType;
    activeProvider: ActiveConnectorType;
    schemas: string[] | [];
    sourceFilePath: string;
}
export type BinaryPaths = {
    schemaEngine?: {
        [binaryTarget: string]: string;
    };
};
/** The options passed to the generator implementations */
export type GeneratorOptions = {
    generator: GeneratorConfig;
    otherGenerators: GeneratorConfig[];
    schemaPath: string;
    dmmf: DMMF.Document;
    datasources: DataSource[];
    datamodel: string;
    version: string;
    binaryPaths?: BinaryPaths;
    noHints?: boolean;
    allowNoModels?: boolean;
    typedSql?: SqlQueryOutput[];
};
export type EngineType = 'schemaEngine';
export type GeneratorManifest = {
    prettyName?: string;
    defaultOutput?: string;
    denylists?: {
        models?: string[];
        fields?: string[];
    };
    requiresGenerators?: string[];
    requiresEngines?: EngineType[];
    version?: string;
    requiresEngineVersion?: string;
};
