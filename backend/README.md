# Workflow LMS Backend

Simple Node.js Express backend for the Workflow LMS project management system.

## Setup Instructions

1. **Install Dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Database Setup:**
   - Make sure MySQL is running
   - Create database: `CREATE DATABASE workflow_db;`
   - Import the schema: `mysql -u root -p workflow_db < ../database/schema.sql`

3. **Environment Configuration:**
   - Copy `env.example` to `.env`
   - Update database credentials in `.env`:
   ```
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=workflow_db
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   ```

4. **Start the Server:**
   ```bash
   # Development mode (with auto-restart)
   npm run dev
   
   # Production mode
   npm start
   ```

5. **Test the Connection:**
   - Open: http://localhost:3001/health
   - Should show database connection status

## File Structure

```
backend/
├── server.js          # Main Express server
├── db.js             # Database connection and utilities  
├── package.json      # Dependencies and scripts
├── env.example       # Environment variables template
└── README.md         # This file
```

## API Endpoints

- `GET /health` - Health check and database status
- `GET /api` - API information

## Dependencies

- **express** - Web framework
- **mysql2** - MySQL database driver
- **cors** - Cross-origin resource sharing
- **helmet** - Security headers
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **dotenv** - Environment variables
- **morgan** - HTTP logging
- **compression** - Response compression
- **express-rate-limit** - Rate limiting
- **express-validator** - Input validation
- **multer** - File uploads
- **cookie-parser** - Cookie parsing

## Database Connection

The database connection is configured in `db.js` with:
- Connection pooling for better performance
- Automatic reconnection
- UTF8MB4 charset support
- Helper methods for common operations

## Next Steps

1. Install dependencies: `npm install`
2. Set up your `.env` file with database credentials
3. Test the connection: `npm run dev`
4. Check health endpoint: http://localhost:3001/health
