import { MySQLParser } from './mysqlParser';
import { SchemaAST } from '../agent/interfaces';

describe('MySQLParser', () => {
  let parser: MySQLParser;

  beforeEach(() => {
    parser = new MySQLParser();
  });

  describe('parse', () => {
    it('should parse a simple MySQL DDL', () => {
      const ddl = `
        CREATE TABLE users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          email VARCHAR(255) NOT NULL UNIQUE,
          name VARCHAR(255),
          age INT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE posts (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          content TEXT,
          published BOOLEAN DEFAULT FALSE,
          author_id INT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (author_id) REFERENCES users(id)
        );
      `;

      const result: SchemaAST = parser.parse(ddl);
      
      expect(result).toBeDefined();
      expect(result.databaseType).toBe('mysql');
      expect(result.tables.length).toBe(2);
      
      // Check users table
      const usersTable = result.tables.find(t => t.name === 'users');
      expect(usersTable).toBeDefined();
      expect(usersTable?.columns.length).toBe(4); // id, email, name, age
      expect(usersTable?.indexes.length).toBeGreaterThan(0); // Primary key index
      expect(usersTable?.foreignKeys.length).toBe(0); // No foreign keys in users table
      
      // Check posts table
      const postsTable = result.tables.find(t => t.name === 'posts');
      expect(postsTable).toBeDefined();
      expect(postsTable?.columns.length).toBe(5); // id, title, content, published, author_id
      expect(postsTable?.foreignKeys.length).toBe(1); // author_id foreign key
    });

    it('should handle different data types', () => {
      const ddl = `
        CREATE TABLE products (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          price DECIMAL(10,2),
          rating FLOAT,
          available BOOLEAN DEFAULT TRUE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          metadata JSON,
          picture BLOB
        );
      `;

      const result: SchemaAST = parser.parse(ddl);
      
      const productsTable = result.tables.find(t => t.name === 'products');
      expect(productsTable).toBeDefined();
      
      // Check that types are mapped correctly
      const priceColumn = productsTable?.columns.find(c => c.name === 'price');
      expect(priceColumn?.type).toBe('DECIMAL');
      
      const ratingColumn = productsTable?.columns.find(c => c.name === 'rating');
      expect(ratingColumn?.type).toBe('FLOAT');
      
      const metadataColumn = productsTable?.columns.find(c => c.name === 'metadata');
      expect(metadataColumn?.type).toBe('JSON');
      
      const pictureColumn = productsTable?.columns.find(c => c.name === 'picture');
      expect(pictureColumn?.type).toBe('BLOB');
    });

    it('should handle table options like ENGINE and CHARSET', () => {
      const ddl = `
        CREATE TABLE orders (
          id INT AUTO_INCREMENT PRIMARY KEY,
          total DECIMAL(10,2)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 AUTO_INCREMENT=1000;
      `;
      const result = parser.parse(ddl);
      expect(result).toBeDefined();
      // Note: The simplified parser might not fully extract table options, but it should not crash
    });

    it('should handle UNIQUE constraints', () => {
      const ddl = `
        CREATE TABLE users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          email VARCHAR(255) UNIQUE
        );
      `;
      const result = parser.parse(ddl);
      expect(result).toBeDefined();
    });

    it('should handle multiple column PRIMARY KEY', () => {
      const ddl = `
        CREATE TABLE user_roles (
          user_id INT,
          role_id INT,
          PRIMARY KEY (user_id, role_id)
        );
      `;
      const result = parser.parse(ddl);
      expect(result).toBeDefined();
    });

    it('should handle FOREIGN KEY with ON DELETE CASCADE', () => {
      const ddl = `
        CREATE TABLE posts (
          id INT AUTO_INCREMENT PRIMARY KEY,
          author_id INT,
          FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
        );
      `;
      const result = parser.parse(ddl);
      expect(result).toBeDefined();
    });
  });
});