import { parse } from 'pgsql-ast-parser';
import { 
  SchemaAST, 
  TableDefinition, 
  ColumnDefinition, 
  IndexDefinition, 
  ForeignKeyDefinition, 
  ConstraintDefinition
} from '../agent/interfaces';

/**
 * PostgreSQL Parser - Parses PostgreSQL DDL files into SchemaAST format
 */
export class PostgresParser {
  /**
   * Parse a PostgreSQL DDL file into SchemaAST format
   * @param ddlContent - The content of the PostgreSQL DDL file
   * @returns SchemaAST representation of the schema
   */
  public parse(ddlContent: string): SchemaAST {
    try {
      // Parse the PostgreSQL DDL
      const parsedAST = parse(ddlContent);
      
      // Convert to our SchemaAST format
      return this.convertToSchemaAST(parsedAST);
    } catch (error) {
      throw new Error(`Failed to parse PostgreSQL DDL: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Convert parsed PostgreSQL AST to our SchemaAST format
   * @param parsedAST - The parsed PostgreSQL AST from pgsql-ast-parser
   * @returns SchemaAST representation
   */
  private convertToSchemaAST(parsedAST: any): SchemaAST {
    const schemaAST: SchemaAST = {
      databaseType: 'postgres',
      tables: [],
      enums: [], // PostgreSQL enums would need special handling
      views: []  // Views would need special handling
    };

    // The AST structure has a 'stmts' array with the statements
    if (parsedAST.stmts && Array.isArray(parsedAST.stmts)) {
      for (const statement of parsedAST.stmts) {
        this.processStatement(statement, schemaAST);
      }
    }

    return schemaAST;
  }

  /**
   * Process a single SQL statement
   * @param statement - The parsed SQL statement
   * @param schemaAST - The SchemaAST to populate
   */
  private processStatement(statement: any, schemaAST: SchemaAST): void {
    if (!statement) return;

    // Process different statement types
    if (statement.type === 'CreateStmt') {
      this.processCreateTableStatement(statement, schemaAST);
    }
    // Add more statement types as needed (ALTER TABLE, CREATE INDEX, etc.)
  }

  /**
   * Process a CREATE TABLE statement
   * @param statement - The parsed CREATE TABLE statement
   * @param schemaAST - The SchemaAST to populate
   */
  private processCreateTableStatement(statement: any, schemaAST: SchemaAST): void {
    if (!statement || !statement.relation || !statement.relation.relname) return;

    const tableName = statement.relation.relname;
    const tableDef: TableDefinition = {
      name: tableName,
      columns: [],
      indexes: [],
      foreignKeys: [],
      constraints: []
    };

    // Process column definitions
    if (statement.tableElts && Array.isArray(statement.tableElts)) {
      for (const element of statement.tableElts) {
        if (element.type === 'ColumnDef') {
          const columnDef = this.parseColumnDefinition(element);
          if (columnDef) {
            tableDef.columns.push(columnDef);
          }
        } else if (element.type === 'Constraint') {
          // Handle constraints like PRIMARY KEY, UNIQUE, FOREIGN KEY, etc.
          this.parseConstraintDefinition(element, tableDef);
        }
      }
    }

    // Process table constraints (if any)
    if (statement.tableElts && Array.isArray(statement.tableElts)) {
      for (const element of statement.tableElts) {
        if (element.type === 'Constraint') {
          this.parseConstraintDefinition(element, tableDef);
        }
      }
    }

    schemaAST.tables.push(tableDef);
  }

  /**
   * Parse a column definition
   * @param element - The parsed column definition
   * @returns ColumnDefinition or null if parsing failed
   */
  private parseColumnDefinition(element: any): ColumnDefinition | null {
    if (!element || !element.colname) return null;

    const columnDef: ColumnDefinition = {
      name: element.colname,
      type: this.parseDataType(element.typeName),
      nullable: !element.isNotNull, // isNotNull false means nullable
      defaultValue: this.parseDefaultValue(element.rawDefault),
      isPrimaryKey: false, // Will be set if part of primary key constraint
      isUnique: false,     // Will be set if part of unique constraint
      autoIncrement: false // PostgreSQL uses SERIAL or IDENTITY for auto increment
    };

    return columnDef;
  }

  /**
   * Parse a data type
   * @param typeName - The parsed type name
   * @returns SQL type string
   */
  private parseDataType(typeName: any): string {
    if (!typeName) return 'VARCHAR(255)';

    // Handle the structure from pgsql-ast-parser
    if (typeName.names && Array.isArray(typeName.names)) {
      // Get the type name (last part of the qualified name)
      const typeNameStr = typeName.names[typeName.names.length - 1].name;
      return this.mapPostgreSQLDataType(typeNameStr);
    }

    // Handle simple type names
    if (typeof typeName === 'string') {
      return this.mapPostgreSQLDataType(typeName);
    }

    return 'VARCHAR(255)'; // Fallback
  }

  /**
   * Map PostgreSQL data type names to SQL types
   * @param type - The PostgreSQL data type name
   * @returns Corresponding SQL type
   */
  private mapPostgreSQLDataType(type: string): string {
    const typeMap: Record<string, string> = {
      // Integer types
      SMALLINT: 'SMALLINT',
      INTEGER: 'INTEGER',
      BIGINT: 'BIGINT',
      
      // Floating point types
      REAL: 'REAL',
      DOUBLE_PRECISION: 'DOUBLE PRECISION',
      
      // Numeric types
      DECIMAL: 'DECIMAL',
      NUMERIC: 'NUMERIC',
      
      // Character types
      CHAR: 'CHAR',
      VARCHAR: 'VARCHAR',
      TEXT: 'TEXT',
      
      // Date and time types
      DATE: 'DATE',
      TIME: 'TIME',
      TIMESTAMP: 'TIMESTAMP',
      TIMESTAMPTZ: 'TIMESTAMPTZ',
      
      // Boolean type
      BOOLEAN: 'BOOLEAN',
      
      // JSON types
      JSON: 'JSON',
      JSONB: 'JSONB',
      
      // UUID type
      UUID: 'UUID',
      
      // Network types
      INET: 'INET',
      CIDR: 'CIDR',
      MACADDR: 'MACADDR',
      
      // Geometric types
      POINT: 'POINT',
      LINE: 'LINE',
      LSEG: 'LSEG',
      BOX: 'BOX',
      PATH: 'PATH',
      POLYGON: 'POLYGON',
      CIRCLE: 'CIRCLE',
      
      // Address types
      MACADDR8: 'MACADDR8',
      
      // Add more type mappings as needed
    };

    return typeMap[type] || 'VARCHAR(255)';
  }

  /**
   * Parse a default value
   * @param rawDefault - The parsed default value
   * @returns Default value string or null
   */
  private parseDefaultValue(rawDefault: any): string | null {
    if (!rawDefault) return null;
    
    // Handle different types of default values
    if (typeof rawDefault === 'string') {
      // Remove quotes if present
      if (rawDefault.startsWith('\"') && rawDefault.endsWith('\"')) {
        return rawDefault.slice(1, -1);
      }
      return rawDefault;
    }
    
    // Handle numeric literals
    if (typeof rawDefault === 'number') {
      return String(rawDefault);
    }
    
    return String(rawDefault);
  }

  /**
   * Parse a constraint definition
   * @param constraint - The parsed constraint definition
   * @param tableDef - The table definition to add the constraint to
   */
  private parseConstraintDefinition(constraint: any, tableDef: TableDefinition): void {
    if (!constraint || !constraint.contype) return;

    switch (constraint.contype) {
      case 'p': // PRIMARY KEY
        // Find the columns that are part of the primary key and mark them
        if (constraint.keys && Array.isArray(constraint.keys)) {
          const keyNames = constraint.keys.map((key: any) => 
            typeof key === 'string' ? key : String(key)
          );
          
          for (const keyName of keyNames) {
            const column = tableDef.columns.find(c => c.name === keyName);
            if (column) {
              column.isPrimaryKey = true;
            }
          }
        }
        break;
        
      case 'u': // UNIQUE
        // Find the columns that are part of the unique constraint and mark them
        if (constraint.keys && Array.isArray(constraint.keys)) {
          const keyNames = constraint.keys.map((key: any) => 
            typeof key === 'string' ? key : String(key)
          );
          
          for (const keyName of keyNames) {
            const column = tableDef.columns.find(c => c.name === keyName);
            if (column) {
              column.isUnique = true;
            }
          }
        }
        break;
        
      case 'f': // FOREIGN KEY
        // Add foreign key to the table
        if (constraint.pk_attrs && Array.isArray(constraint.pk_attrs) &&
            constraint.fk_attrs && Array.isArray(constraint.fk_attrs) &&
            constraint.pktable && constraint.pktable.relname) {
          
          const fkDef: ForeignKeyDefinition = {
            name: constraint.conname || this.generateForeignKeyName(
              tableDef.name, 
              constraint.fk_attrs[0] || 'unknown'
            ),
            columnNames: constraint.fk_attrs.map((attr: any) => 
              typeof attr === 'string' ? attr : String(attr)
            ),
            referencedTable: constraint.pktable.relname,
            referencedColumnNames: constraint.pk_attrs.map((attr: any) => 
              typeof attr === 'string' ? attr : String(attr)
            ),
            onDelete: this.convertForeignKeyAction(constraint.confdelobj),
            onUpdate: this.convertForeignKeyAction(constraint.confupobj)
          };
          tableDef.foreignKeys.push(fkDef);
        }
        break;
        
      case 'c': // CHECK constraint
        // For now, we'll just note that there's a check constraint
        // A full implementation would parse the check condition
        break;
        
      default:
        // Ignore other constraint types for now
        break;
    }
  }

  /**
   * Convert foreign key action from PostgreSQL format to our format
   * @param actionObj - The action object from PostgreSQL AST
   * @returns String representation of the action
   */
  private convertForeignKeyAction(actionObj: any): string {
    if (!actionObj) return 'RESTRICT';
    
    // Map PostgreSQL action codes to strings
    const actionMap: Record<number, string> = {
      0: 'NO ACTION',
      1: 'RESTRICT',
      2: 'CASCADE',
      3: 'SET NULL',
      4: 'SET DEFAULT'
    };
    
    // If it's a numeric code, map it
    if (typeof actionObj === 'number') {
      return actionMap[actionObj] || 'RESTRICT';
    }
    
    // If it's already a string, return it
    if (typeof actionObj === 'string') {
      return actionObj;
    }
    
    return 'RESTRICT';
  }

  /**
   * Generate a name for a foreign key constraint
   * @param tableName - The table name
   * @param columnName - The column name
   * @returns Generated foreign key name
   */
  private generateForeignKeyName(tableName: string, columnName: string): string {
    return `fk_${tableName}_${columnName}`;
  }
}