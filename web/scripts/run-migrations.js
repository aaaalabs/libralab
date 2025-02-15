const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');

async function runMigrations() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  try {
    const client = await pool.connect();
    try {
      const migrationsDir = path.join(__dirname, '..', 'src', 'db', 'migrations');
      const files = await fs.readdir(migrationsDir);
      
      for (const file of files.sort()) {
        if (file.endsWith('.sql')) {
          console.log(`Running migration: ${file}`);
          const sql = await fs.readFile(path.join(migrationsDir, file), 'utf8');
          await client.query(sql);
          console.log(`Completed migration: ${file}`);
        }
      }
      
      console.log('All migrations completed successfully');
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations();
