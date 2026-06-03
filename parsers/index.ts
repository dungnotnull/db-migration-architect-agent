import { PrismaParser } from './prismaParser';
import { MySQLParser } from './mysqlParser';
import { MongoDBParser } from './mongodbParser';
import { PostgresParser } from './postgresParser';

/**
 * Factory function to create the appropriate parser based on schema type
 * @param schemaType - The type of schema ('prisma', 'mysql', 'postgres', or 'mongodb')
 * @returns Instance of the appropriate parser
 */
export function createParser(schemaType: 'prisma' | 'mysql' | 'postgres' | 'mongodb') {
  switch (schemaType.toLowerCase()) {
    case 'prisma':
      return new PrismaParser();
    case 'mysql':
      return new MySQLParser();
    case 'postgres':
      return new PostgresParser();
    case 'mongodb':
      return new MongoDBParser();
    default:
      throw new Error(`Unsupported schema type: ${schemaType}`);
  }
}