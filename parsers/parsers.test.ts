import { createParser } from './index';
import { PrismaParser } from './prismaParser';
import { MySQLParser } from './mysqlParser';
// Import MongoDBParser to ensure it's included in compilation for the error test
import { MongoDBParser } from './mongodbParser';

describe('Parser Factory', () => {
  describe('createParser', () => {
    it('should create a Prisma parser', () => {
      const parser = createParser('prisma');
      expect(parser).toBeInstanceOf(PrismaParser);
    });

    it('should create a MySQL parser', () => {
      const parser = createParser('mysql');
      expect(parser).toBeInstanceOf(MySQLParser);
    });

    it('should create a MongoDB parser', () => {
      const parser = createParser('mongodb');
      expect(parser).toBeInstanceOf(MongoDBParser);
    });
  });
});