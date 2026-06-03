import { MongoDBParser } from './mongodbParser';
import { SchemaAST } from '../agent/interfaces';

describe('MongoDBParser', () => {
  let parser: MongoDBParser;

  beforeEach(() => {
    parser = new MongoDBParser();
  });

  describe('parse', () => {
    it('should parse a simple MongoDB JSON schema', async () => {
      const schemaJson = JSON.stringify([
        {
          name: 'users',
          fields: {
            _id: { type: 'ObjectId', required: true },
            username: { type: 'String', required: true, unique: true },
            email: { type: 'String', required: false },
            createdAt: { type: 'Date', required: true, default: 'new Date()' }
          }
        }
      ]);

      const result: SchemaAST = await parser.parse(schemaJson);
      
      expect(result).toBeDefined();
      expect(result.databaseType).toBe('mongodb');
      expect(result.tables.length).toBe(1);
      
      const usersTable = result.tables.find(t => t.name === 'users');
      expect(usersTable).toBeDefined();
      expect(usersTable?.columns.length).toBe(4);
      
      const idColumn = usersTable?.columns.find(c => c.name === '_id');
      expect(idColumn?.isPrimaryKey).toBe(true);
      expect(idColumn?.type).toBe('VARCHAR(24)');
      
      const usernameColumn = usersTable?.columns.find(c => c.name === 'username');
      expect(usernameColumn?.isUnique).toBe(true);
      expect(usernameColumn?.nullable).toBe(false);
    });

    it('should parse indexes correctly', async () => {
      const schemaJson = JSON.stringify([
        {
          name: 'posts',
          fields: {
            _id: { type: 'ObjectId', required: true },
            title: { type: 'String', required: true },
            authorId: { type: 'ObjectId', required: true }
          },
          indexes: [
            {
              name: 'authorId_1',
              keys: { authorId: 1 },
              unique: false
            },
            {
              name: 'title_text',
              keys: { title: 'text' }
            }
          ]
        }
      ]);

      const result = await parser.parse(schemaJson);
      const postsTable = result.tables.find(t => t.name === 'posts');
      
      expect(postsTable?.indexes.length).toBeGreaterThan(0);
      const authorIndex = postsTable?.indexes.find(i => i.name === 'authorId_1');
      expect(authorIndex?.indexType).toBe('BTREE');
      
      const titleIndex = postsTable?.indexes.find(i => i.name === 'title_text');
      expect(titleIndex?.indexType).toBe('TEXT');
    });

    it('should auto-generate indexes for unique fields', async () => {
      const schemaJson = JSON.stringify([
        {
          name: 'products',
          fields: {
            _id: { type: 'ObjectId', required: true },
            sku: { type: 'String', required: true, unique: true }
          }
        }
      ]);

      const result = await parser.parse(schemaJson);
      const productsTable = result.tables.find(t => t.name === 'products');
      
      // Should have _id index and sku unique index
      expect(productsTable?.indexes.length).toBe(2);
      const skuIndex = productsTable?.indexes.find(i => i.columns.includes('sku'));
      expect(skuIndex?.isUnique).toBe(true);
    });

    it('should handle single collection object (not array)', async () => {
      const schemaJson = JSON.stringify({
        name: 'single_collection',
        fields: {
          _id: { type: 'ObjectId', required: true }
        }
      });

      const result = await parser.parse(schemaJson);
      expect(result.tables.length).toBe(1);
      expect(result.tables[0].name).toBe('single_collection');
    });

    it('should map MongoDB types to SQL-like types correctly', async () => {
      const schemaJson = JSON.stringify([
        {
          name: 'types_test',
          fields: {
            str: { type: 'String' },
            num: { type: 'Number' },
            int: { type: 'Int' },
            bool: { type: 'Boolean' },
            date: { type: 'Date' },
            obj: { type: 'Object' },
            arr: { type: 'Array' },
            dec: { type: 'Decimal128' },
            buf: { type: 'Buffer' }
          }
        }
      ]);

      const result = await parser.parse(schemaJson);
      const table = result.tables[0];
      
      expect(table.columns.find(c => c.name === 'str')?.type).toBe('VARCHAR(255)');
      expect(table.columns.find(c => c.name === 'num')?.type).toBe('DOUBLE');
      expect(table.columns.find(c => c.name === 'int')?.type).toBe('INTEGER');
      expect(table.columns.find(c => c.name === 'bool')?.type).toBe('BOOLEAN');
      expect(table.columns.find(c => c.name === 'date')?.type).toBe('TIMESTAMP');
      expect(table.columns.find(c => c.name === 'obj')?.type).toBe('JSONB');
      expect(table.columns.find(c => c.name === 'arr')?.type).toBe('JSONB');
      expect(table.columns.find(c => c.name === 'dec')?.type).toBe('DECIMAL');
      expect(table.columns.find(c => c.name === 'buf')?.type).toBe('BYTEA');
    });
  });
});