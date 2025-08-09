import mysql from 'mysql2/promise';
import { config } from './env';

// Database connection configuration
const dbConfig = {
  host: config.DB_HOST,
  port: config.DB_PORT,
  user: config.DB_USER,
  password: config.DB_PASSWORD,
  database: config.DB_NAME,
  connectionLimit: config.DB_CONNECTION_LIMIT,
  queueLimit: config.DB_QUEUE_LIMIT,
  acquireTimeout: config.DB_ACQUIRE_TIMEOUT,
  timeout: config.DB_TIMEOUT,
  reconnect: true,
  charset: 'utf8mb4',
  timezone: '+00:00',
  dateStrings: false,
  supportBigNumbers: true,
  bigNumberStrings: false,
  multipleStatements: false,
  namedPlaceholders: true
};

// Create connection pool
export const pool = mysql.createPool(dbConfig);

// Database connection class
export class Database {
  private static instance: Database;
  private pool: mysql.Pool;

  private constructor() {
    this.pool = pool;
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  // Get connection from pool
  public async getConnection(): Promise<mysql.PoolConnection> {
    try {
      const connection = await this.pool.getConnection();
      return connection;
    } catch (error) {
      console.error('Error getting database connection:', error);
      throw new Error('Failed to get database connection');
    }
  }

  // Execute query with connection management
  public async query<T = any>(sql: string, params?: any[]): Promise<T[]> {
    const connection = await this.getConnection();
    try {
      const [rows] = await connection.execute(sql, params);
      return rows as T[];
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  // Execute query and return first row
  public async queryFirst<T = any>(sql: string, params?: any[]): Promise<T | null> {
    const results = await this.query<T>(sql, params);
    return results.length > 0 ? results[0] : null;
  }

  // Execute insert and return insert ID
  public async insert(sql: string, params?: any[]): Promise<number> {
    const connection = await this.getConnection();
    try {
      const [result] = await connection.execute(sql, params);
      const insertResult = result as mysql.ResultSetHeader;
      return insertResult.insertId;
    } catch (error) {
      console.error('Database insert error:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  // Execute update/delete and return affected rows
  public async execute(sql: string, params?: any[]): Promise<number> {
    const connection = await this.getConnection();
    try {
      const [result] = await connection.execute(sql, params);
      const executeResult = result as mysql.ResultSetHeader;
      return executeResult.affectedRows;
    } catch (error) {
      console.error('Database execute error:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  // Transaction support
  public async transaction<T>(
    callback: (connection: mysql.PoolConnection) => Promise<T>
  ): Promise<T> {
    const connection = await this.getConnection();
    try {
      await connection.beginTransaction();
      const result = await callback(connection);
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      console.error('Transaction error:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  // Test database connection
  public async testConnection(): Promise<boolean> {
    try {
      const connection = await this.getConnection();
      await connection.ping();
      connection.release();
      console.log('✅ Database connection successful');
      return true;
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      return false;
    }
  }

  // Close all connections
  public async close(): Promise<void> {
    try {
      await this.pool.end();
      console.log('Database connections closed');
    } catch (error) {
      console.error('Error closing database connections:', error);
    }
  }

  // Get pool status
  public getPoolStatus() {
    const poolConfig = this.pool.pool.config;
    const poolConnections = this.pool.pool._allConnections.length;
    const poolQueue = this.pool.pool._connectionQueue.length;
    
    return {
      totalConnections: poolConnections,
      queuedConnections: poolQueue,
      connectionLimit: poolConfig.connectionLimit,
      acquireTimeout: poolConfig.acquireTimeout
    };
  }
}

// Export database instance
export const db = Database.getInstance();

// Export pool for direct access if needed
export { pool as mysqlPool };

// Helper function for pagination
export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export function buildPaginationQuery(
  baseQuery: string,
  options: PaginationOptions,
  countQuery?: string
): { query: string; countQuery: string; offset: number; limit: number } {
  const page = Math.max(1, options.page || 1);
  const limit = Math.min(100, Math.max(1, options.limit || 20));
  const offset = (page - 1) * limit;
  
  let query = baseQuery;
  
  // Add sorting
  if (options.sortBy) {
    const sortOrder = options.sortOrder || 'ASC';
    query += ` ORDER BY ${options.sortBy} ${sortOrder}`;
  }
  
  // Add pagination
  query += ` LIMIT ${limit} OFFSET ${offset}`;
  
  // Build count query if not provided
  if (!countQuery) {
    countQuery = baseQuery.replace(/SELECT .+ FROM/, 'SELECT COUNT(*) as total FROM');
    // Remove ORDER BY clause from count query
    countQuery = countQuery.replace(/ORDER BY .+?(?=LIMIT|$)/i, '');
    // Remove LIMIT clause from count query
    countQuery = countQuery.replace(/LIMIT .+$/i, '');
  }
  
  return { query, countQuery, offset, limit };
}
