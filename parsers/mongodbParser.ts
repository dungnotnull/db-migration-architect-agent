import { 
  SchemaAST, 
  TableDefinition, 
  ColumnDefinition, 
  IndexDefinition, 
  ForeignKeyDefinition, 
  ConstraintDefinition
} from '../agent/interfaces';

export interface MongoDBCollectionSchema {
  name: string;
  fields: Record<string, {
    type: string;
    required?: boolean;
    default?: any;
    unique?: boolean;
    index?: boolean;
    ref?: string; // For references to other collections
  }>;
  indexes?: {
    name: string;
    keys: Record<string, 1 | -1 | '2dsphere' | 'text' | 'hashed'>;
    unique?: boolean;
  }[];
}

/**
 * MongoDB Parser - Parses JSON schema definitions into SchemaAST format
 * Supports MongoDB JSON Schema validation format and simplified Mongoose-like definitions
 */
export class MongoDBParser {
  /**
   * Parse a MongoDB JSON schema definition into SchemaAST format
   * @param schemaContent - The JSON string representing the MongoDB schema
   * @returns SchemaAST representation of the schema
   */
  public async parse(schemaContent: string): Promise<SchemaAST> {
    try {
      const parsed = JSON.parse(schemaContent);
      return this.convertToSchemaAST(parsed);
    } catch (error) {
      throw new Error(`Failed to parse MongoDB JSON schema: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Convert parsed MongoDB schema to our SchemaAST format
   */
  private convertToSchemaAST(parsed: any): SchemaAST {
    const schemaAST: SchemaAST = {
      databaseType: 'mongodb',
      tables: [],
      enums: [],
      views: []
    };

    // Handle both array of collections and single collection object
    const collections = Array.isArray(parsed) ? parsed : (parsed.collections || [parsed]);

    for (const collection of collections) {
      const tableDef = this.parseCollection(collection);
      if (tableDef) {
        schemaAST.tables.push(tableDef);
      }
    }

    return schemaAST;
  }

  /**
   * Parse a single collection definition
   */
  private parseCollection(collection: MongoDBCollectionSchema | any): TableDefinition | null {
    if (!collection || !collection.name) {
      return null;
    }

    const tableDef: TableDefinition = {
      name: collection.name,
      columns: [],
      indexes: [],
      foreignKeys: [],
      constraints: []
    };

    // Parse fields
    if (collection.fields) {
      for (const [fieldName, fieldDef] of Object.entries(collection.fields)) {
        const columnDef = this.parseField(fieldName, fieldDef as any);
        if (columnDef) {
          tableDef.columns.push(columnDef);
        }
      }
    }

    // Parse indexes
    if (collection.indexes && Array.isArray(collection.indexes)) {
      for (const index of collection.indexes) {
        const indexDef = this.parseIndex(index);
        if (indexDef) {
          tableDef.indexes.push(indexDef);
        }
      }
    }

    // Auto-generate indexes from field definitions if not explicitly defined
    this.autoGenerateIndexes(tableDef);

    // Parse foreign keys (references)
    this.extractForeignKeys(tableDef);

    return tableDef;
  }

  /**
   * Parse a single field definition
   */
  private parseField(fieldName: string, fieldDef: any): ColumnDefinition | null {
    if (!fieldName) return null;

    const mongoType = fieldDef.type || 'String';
    const sqlType = this.mapMongoTypeToSQLType(mongoType);

    return {
      name: fieldName,
      type: sqlType,
      nullable: !fieldDef.required,
      defaultValue: fieldDef.default !== undefined ? String(fieldDef.default) : null,
      isPrimaryKey: fieldName === '_id',
      isUnique: fieldDef.unique || false,
      autoIncrement: false // MongoDB uses ObjectId, not auto-increment
    };
  }

  /**
   * Map MongoDB types to generic SQL-like types for our AST
   */
  private mapMongoTypeToSQLType(mongoType: string): string {
    const typeMap: Record<string, string> = {
      'String': 'VARCHAR(255)',
      'Number': 'DOUBLE',
      'Int': 'INTEGER',
      'Boolean': 'BOOLEAN',
      'Date': 'TIMESTAMP',
      'ObjectId': 'VARCHAR(24)', // ObjectId is 24 hex chars
      'Object': 'JSONB',
      'Array': 'JSONB',
      'Decimal128': 'DECIMAL',
      'Buffer': 'BYTEA'
    };

    return typeMap[mongoType] || 'VARCHAR(255)';
  }

  /**
   * Parse an index definition
   */
  private parseIndex(index: any): IndexDefinition | null {
    if (!index || !index.keys) return null;

    const columns = Object.keys(index.keys);
    const indexType = this.determineIndexType(index.keys);

    return {
      name: index.name || `idx_${columns.join('_')}`,
      columns,
      isUnique: index.unique || false,
      isPrimary: columns.includes('_id'),
      indexType
    };
  }

  /**
   * Determine index type based on keys
   */
  private determineIndexType(keys: Record<string, any>): string {
    const values = Object.values(keys);
    if (values.includes('2dsphere')) return '2DSPHERE';
    if (values.includes('text')) return 'TEXT';
    if (values.includes('hashed')) return 'HASHED';
    return 'BTREE'; // Default for standard indexes
  }

  /**
   * Auto-generate indexes from field definitions
   */
  private autoGenerateIndexes(tableDef: TableDefinition): void {
    for (const column of tableDef.columns) {
      if (column.isPrimaryKey && !tableDef.indexes.some(i => i.isPrimary)) {
        tableDef.indexes.push({
          name: '_id_',
          columns: ['_id'],
          isUnique: true,
          isPrimary: true,
          indexType: 'BTREE'
        });
      } else if (column.isUnique && !tableDef.indexes.some(i => i.columns.includes(column.name) && i.isUnique)) {
        tableDef.indexes.push({
          name: `${column.name}_1`,
          columns: [column.name],
          isUnique: true,
          isPrimary: false,
          indexType: 'BTREE'
        });
      }
    }
  }

  /**
   * Extract foreign keys from reference fields
   */
  private extractForeignKeys(tableDef: TableDefinition): void {
    // This is a simplified extraction. In a real Mongoose schema, 
    // we'd look for { type: ObjectId, ref: 'CollectionName' }
    // For now, we check if the field name ends with 'Id' and has a ref
    // This is handled during field parsing if we had the full schema context
  }
}