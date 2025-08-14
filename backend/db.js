const mysql = require('mysql2/promise');
require('dotenv').config();

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'workflow_db',
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
  charset: 'utf8mb4',
  timezone: '+00:00'
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Database helper functions
const db = {
  // Execute query
  async query(sql, params = []) {
    try {
      const [rows] = await pool.execute(sql, params);
      return rows;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  },

  // Get first row
  async queryFirst(sql, params = []) {
    try {
      const rows = await this.query(sql, params);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      throw error;
    }
  },

  // Insert and return full result object
  async insert(sql, params = []) {
    try {
      const [result] = await pool.execute(sql, params);
      return result; // Return full result object with insertId
    } catch (error) {
      console.error('Database insert error:', error);
      throw error;
    }
  },

  // Execute query and return full result
  async execute(sql, params = []) {
    try {
      const [result] = await pool.execute(sql, params);
      return result;
    } catch (error) {
      console.error('Database execute error:', error);
      throw error;
    }
  },

  // Test connection
  async testConnection() {
    try {
      const connection = await pool.getConnection();
      await connection.ping();
      connection.release();
      console.log('✅ Database connected successfully to:', process.env.DB_NAME);
      return true;
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      return false;
    }
  },

  // Close connections
  async close() {
    try {
      await pool.end();
      console.log('Database connections closed');
    } catch (error) {
      console.error('Error closing database:', error);
    }
  },

  // Get pool instance
  getPool() {
    return pool;
  }
};

module.exports = db;
