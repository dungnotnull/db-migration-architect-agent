export declare type Datamodel = ReadonlyDeep<{
    models: Model[];
    enums: DatamodelEnum[];
    types: Model[];
    indexes: Index[];
}>;

export declare type DatamodelEnum = ReadonlyDeep<{
    name: string;
    values: EnumValue[];
    dbName?: string | null;
    documentation?: string;
}>;

export declare function datamodelEnumToSchemaEnum(datamodelEnum: DatamodelEnum): SchemaEnum;

export declare type Deprecation = ReadonlyDeep<{
    sinceVersion: string;
    reason: string;
    plannedRemovalVersion?: string;
}>;

declare type Document_2 = ReadonlyDeep<{
    datamodel: Datamodel;
    schema: Schema;
    mappings: Mappings;
}>;
export { Document_2 as Document }

export declare type EnumValue = ReadonlyDeep<{
    name: string;
    dbName: string | null;
}>;

export declare type Field = ReadonlyDeep<{
    kind: FieldKind;
    name: string;
    isRequired: boolean;
    isList: boolean;
    isUnique: boolean;
    isId: boolean;
    isReadOnly: boolean;
    isGenerated?: boolean;
    isUpdatedAt?: boolean;
    /**
     * Describes the data type in the same the way it is defined in the Prisma schema:
     * BigInt, Boolean, Bytes, DateTime, Decimal, Float, Int, JSON, String, $ModelName
     */
    type: string;
    /**
     * Native database type, if specified.
     * For example, `@db.VarChar(191)` is encoded as `['VarChar', ['191']]`,
     * `@db.Text` is encoded as `['Text', []]`.
     */
    nativeType?: [string, string[]] | null;
    dbName?: string | null;
    hasDefaultValue: boolean;
    default?: FieldDefault | FieldDefaultScalar | FieldDefaultScalar[];
    relationFromFields?: string[];
    relationToFields?: string[];
    relationOnDelete?: string;
    relationOnUpdate?: string;
    relationName?: string;
    documentation?: string;
}>;

export declare type FieldDefault = ReadonlyDeep<{
    name: string;
    args: Array<string | number>;
}>;

export declare type FieldDefaultScalar = string | boolean | number;

export declare type FieldKind = 'scalar' | 'object' | 'enum' | 'unsupported';

export declare type FieldLocation = 'scalar' | 'inputObjectTypes' | 'outputObjectTypes' | 'enumTypes' | 'fieldRefTypes';

export declare type FieldNamespace = 'model' | 'prisma';

export declare type FieldRefAllowType = TypeRef<'scalar' | 'enumTypes'>;

export declare type FieldRefType = ReadonlyDeep<{
    name: string;
    allowTypes: FieldRefAllowType[];
    fields: SchemaArg[];
}>;

export declare type Index = ReadonlyDeep<{
    model: string;
    type: IndexType;
    isDefinedOnField: boolean;
    name?: string;
    dbName?: string;
    algorithm?: string;
    clustered?: boolean;
    fields: IndexField[];
}>;

export declare type IndexField = ReadonlyDeep<{
    name: string;
    sortOrder?: SortOrder;
    length?: number;
    operatorClass?: string;
}>;

export declare type IndexType = 'id' | 'normal' | 'unique' | 'fulltext';

export declare type InputType = ReadonlyDeep<{
    name: string;
    constraints: {
        maxNumFields: number | null;
        minNumFields: number | null;
        fields?: string[];
    };
    meta?: {
        source?: string;
        grouping?: string;
    };
    fields: SchemaArg[];
}>;

export declare type InputTypeRef = TypeRef<'scalar' | 'inputObjectTypes' | 'enumTypes' | 'fieldRefTypes'>;

export declare type Mappings = ReadonlyDeep<{
    modelOperations: ModelMapping[];
    otherOperations: {
        read: string[];
        write: string[];
    };
}>;

export declare type Model = ReadonlyDeep<{
    name: string;
    dbName: string | null;
    schema: string | null;
    fields: Field[];
    uniqueFields: string[][];
    uniqueIndexes: uniqueIndex[];
    documentation?: string;
    primaryKey: PrimaryKey | null;
    isGenerated?: boolean;
}>;

export declare enum ModelAction {
    findUnique = "findUnique",
    findUniqueOrThrow = "findUniqueOrThrow",
    findFirst = "findFirst",
    findFirstOrThrow = "findFirstOrThrow",
    findMany = "findMany",
    create = "create",
    createMany = "createMany",
    createManyAndReturn = "createManyAndReturn",
    update = "update",
    updateMany = "updateMany",
    updateManyAndReturn = "updateManyAndReturn",
    upsert = "upsert",
    delete = "delete",
    deleteMany = "deleteMany",
    groupBy = "groupBy",
    count = "count",// TODO: count does not actually exist in DMMF
    aggregate = "aggregate",
    findRaw = "findRaw",
    aggregateRaw = "aggregateRaw"
}

export declare type ModelMapping = ReadonlyDeep<{
    model: string;
    plural: string;
    findUnique?: string | null;
    findUniqueOrThrow?: string | null;
    findFirst?: string | null;
    findFirstOrThrow?: string | null;
    findMany?: string | null;
    create?: string | null;
    createMany?: string | null;
    createManyAndReturn?: string | null;
    update?: string | null;
    updateMany?: string | null;
    updateManyAndReturn?: string | null;
    upsert?: string | null;
    delete?: string | null;
    deleteMany?: string | null;
    aggregate?: string | null;
    groupBy?: string | null;
    count?: string | null;
    findRaw?: string | null;
    aggregateRaw?: string | null;
}>;

export declare type OtherOperationMappings = ReadonlyDeep<{
    read: string[];
    write: string[];
}>;

export declare type OutputType = ReadonlyDeep<{
    name: string;
    fields: SchemaField[];
}>;

export declare type OutputTypeRef = TypeRef<'scalar' | 'outputObjectTypes' | 'enumTypes'>;

export declare type PrimaryKey = ReadonlyDeep<{
    name: string | null;
    fields: string[];
}>;

export declare type Query = ReadonlyDeep<{
    name: string;
    args: SchemaArg[];
    output: QueryOutput;
}>;

export declare type QueryOutput = ReadonlyDeep<{
    name: string;
    isRequired: boolean;
    isList: boolean;
}>;

export declare type ReadonlyDeep<O> = {
    +readonly [K in keyof O]: ReadonlyDeep<O[K]>;
};

export declare type Schema = ReadonlyDeep<{
    rootQueryType?: string;
    rootMutationType?: string;
    inputObjectTypes: {
        model?: InputType[];
        prisma?: InputType[];
    };
    outputObjectTypes: {
        model: OutputType[];
        prisma: OutputType[];
    };
    enumTypes: {
        model?: SchemaEnum[];
        prisma: SchemaEnum[];
    };
    fieldRefTypes: {
        prisma?: FieldRefType[];
    };
}>;

export declare type SchemaArg = ReadonlyDeep<{
    name: string;
    comment?: string;
    isNullable: boolean;
    isRequired: boolean;
    inputTypes: InputTypeRef[];
    isParameterizable: boolean;
    requiresOtherFields?: string[];
    deprecation?: Deprecation;
}>;

export declare type SchemaEnum = ReadonlyDeep<{
    name: string;
    values: string[];
}>;

export declare type SchemaField = ReadonlyDeep<{
    name: string;
    isNullable?: boolean;
    outputType: OutputTypeRef;
    args: SchemaArg[];
    deprecation?: Deprecation;
    documentation?: string;
}>;

export declare type SortOrder = 'asc' | 'desc';

export declare type TypeRef<AllowedLocations extends FieldLocation> = {
    isList: boolean;
    type: string;
    location: AllowedLocations;
    namespace?: FieldNamespace;
};

export declare type uniqueIndex = ReadonlyDeep<{
    name: string;
    fields: string[];
}>;

export { }
